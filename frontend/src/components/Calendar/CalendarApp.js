'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import GroupCalendars from '@/components/Sidebar/GroupCalendars';
import CalendarHeader from '@/components/Calendar/CalendarHeader';
import MonthView from '@/components/Calendar/MonthView';
import WeekView from '@/components/Calendar/WeekView';
import DayView from '@/components/Calendar/DayView';
import AddEditEventModal from '@/components/Modals/AddEditEventModal';
import EventDetailsModal from '@/components/Modals/EventDetailsModal';
import ProfileModal from '@/components/Modals/ProfileModal';
import NotificationSnackbar from '@/components/Modals/NotificationSnackbar';
import { useCalendar } from '@/hooks/useCalendar';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/contexts/ThemeContext';

const CalendarApp = () => {
  const { currentDate, view, handleViewChange } = useCalendar();
  const { isProfileOpen, handleProfileOpen, handleProfileClose, displayName, profileImage } = useProfile();
  const { darkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [shiftDirection, setShiftDirection] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', action: '', isVisible: false });
  const [lastUpdatedEvent, setLastUpdatedEvent] = useState(null);

  useEffect(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    setSelectedWeekStart(weekStart);
    setSelectedDate(today);

    fetchEvents();
  }, [displayName]);

  const showNotification = (message, action = '') => {
    setNotification({ message, action, isVisible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const response = await fetch('http://localhost:5000/events', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
  
        const formattedEvents = data.map(event => {
          const startTime = new Date(event.start_time);
          const endTime = new Date(event.end_time);
          return {
            ...event,
            date: startTime.toLocaleDateString(),
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });
        setEvents(formattedEvents);
        console.log('Fetched events:', formattedEvents);
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showNotification('Failed to fetch events');
    }
  };

  const handleDateChange = (date, direction) => {
    setShiftDirection(direction);
    if (view === 'Week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      setSelectedWeekStart(weekStart);
    }
    setSelectedDate(date);
    setTimeout(() => setShiftDirection(null), 300);
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    if (view === 'Week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      setSelectedWeekStart(weekStart);
    }
  };

  const handleAddEvent = (date = null) => {
    setSelectedEvent(null);
    setSelectedDate(date || selectedDate);
    setIsAddingEvent(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleCloseEventDetails = () => {
    setIsEventDetailsOpen(false);
    setSelectedEvent(null);
  };

  const handleEditFromDetails = () => {
    setIsEventDetailsOpen(false);
    setIsAddingEvent(true);
  };

  const handleCloseModal = () => {
    setIsAddingEvent(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = async (event) => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    showNotification('Saving...');
    try {
      const method = event.id ? 'PUT' : 'POST';
      const url = event.id ? `http://localhost:5000/events/${event.id}` : 'http://localhost:5000/events';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(event),
      });
  
      if (response.ok) {
        const savedEvent = await response.json();
        const startTime = new Date(savedEvent.event.start_time);
        const endTime = new Date(savedEvent.event.end_time);
        const formattedEvent = {
          ...savedEvent.event,
          date: startTime.toLocaleDateString(),
          startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
  
        setEvents((prevEvents) => {
          if (event.id) {
            return prevEvents.map((e) => (e.id === event.id ? formattedEvent : e));
          } else {
            return [...prevEvents, formattedEvent];
          }
        });
  
        console.log('Event saved successfully:', formattedEvent);
        setIsAddingEvent(false);
        setSelectedEvent(null);
        showNotification('Event saved successfully', 'Undo');
      } else {
        throw new Error('Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      showNotification('Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    showNotification('Deleting...');
    try {
      const response = await fetch(`http://localhost:5000/events/${eventId}`, {
        method: 'DELETE',
        headers: {
        },
        credentials: 'include',
      });

      if (response.ok) {
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
        setIsEventDetailsOpen(false);
        setSelectedEvent(null);
        console.log('Event deleted successfully');
        showNotification('Event deleted successfully', 'Undo');
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification('Failed to delete event');
    }
  };

  const handleEventUpdate = async (eventId, newDate) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    showNotification('Updating...');
    try {
      const eventToUpdate = events.find(event => event.id === eventId);
      if (!eventToUpdate) return;

      // Store the current state of the event before updating
      setLastUpdatedEvent({ ...eventToUpdate });

      const startTime = new Date(eventToUpdate.start_time);
      const endTime = new Date(eventToUpdate.end_time);
      const duration = endTime - startTime;

      const newStartTime = new Date(newDate);
      newStartTime.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds());
      const newEndTime = new Date(newStartTime.getTime() + duration);

      const updatedEvent = {
        ...eventToUpdate,
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString(),
      };

      // Optimistic update
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId ? {
            ...updatedEvent,
            date: newStartTime.toLocaleDateString(),
            startTime: newStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: newEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          } : event
        )
      );

      const response = await fetch(`http://localhost:5000/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(updatedEvent),
      });

      if (response.ok) {
        const savedEvent = await response.json();
        console.log('Event updated successfully:', savedEvent);
        showNotification('Event updated', 'Undo');
      } else {
        throw new Error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      showNotification('Failed to update event');
      fetchEvents();
    }
  };

  const handleUndoAction = async () => {
    if (lastUpdatedEvent) {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`http://localhost:5000/events/${lastUpdatedEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(lastUpdatedEvent),
        });

        if (response.ok) {
          setEvents(prevEvents =>
            prevEvents.map(event =>
              event.id === lastUpdatedEvent.id ? lastUpdatedEvent : event
            )
          );
          showNotification('Event reverted successfully');
        } else {
          throw new Error('Failed to undo event update');
        }
      } catch (error) {
        console.error('Error undoing event update:', error);
        showNotification('Failed to undo event update');
      }

      setLastUpdatedEvent(null);
    } else {
      showNotification('Nothing to undo');
    }
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMiniCalendarDateSelect = (date) => {
    handleDateChange(date, 'none');
    if (view === 'Week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      setSelectedWeekStart(weekStart);
    }
    setSelectedDate(date);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarHeader 
          currentDate={selectedDate || currentDate}
          view={view}
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
          onAddEvent={() => handleAddEvent()}
        />
        <div className="flex-1 overflow-auto">
          {view === 'Month' && (
            <MonthView 
              currentDate={selectedDate || currentDate}
              selectedDate={selectedDate}
              events={events} 
              onDateClick={handleDayClick}
              onDateDoubleClick={handleAddEvent}
              onEventClick={handleEventClick}
              shiftDirection={shiftDirection}
              onViewChange={handleViewChange}
              onEventUpdate={handleEventUpdate}
            />
          )}
          {view === 'Week' && (
            <WeekView 
              currentDate={selectedDate || currentDate}
              selectedDate={selectedDate}
              events={events} 
              onDateClick={handleDayClick}
              onDateDoubleClick={handleAddEvent}
              onEventClick={handleEventClick}
              shiftDirection={shiftDirection}
              onEventUpdate={handleEventUpdate}
            />
          )}
          {view === 'Day' && (
            <DayView 
              currentDate={selectedDate || currentDate} 
              events={events} 
              onDateDoubleClick={handleAddEvent}
              onEventClick={handleEventClick}
              shiftDirection={shiftDirection}
            />
          )}
        </div>
      </div>
      <div className="flex">
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-0'} overflow-hidden`}>
          {isSidebarOpen && (
            <Sidebar 
              onDateSelect={handleMiniCalendarDateSelect}
              currentView={view}
              onViewChange={handleViewChange}
              onClose={toggleSidebar}
              mainCalendarDate={selectedDate || currentDate}
            />
          )}
        </div>
        <GroupCalendars 
          onProfileOpen={handleProfileOpen}
          displayName={displayName}
          profileImage={profileImage}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
      {isEventDetailsOpen && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={handleCloseEventDetails}
          onEdit={handleEditFromDetails}
          onDelete={handleDeleteEvent}
        />
      )}
      {isAddingEvent && (
        <AddEditEventModal 
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          initialDate={selectedDate}
          event={selectedEvent}
        />
      )}
      {isProfileOpen && <ProfileModal onClose={handleProfileClose} />}
      <NotificationSnackbar
        message={notification.message}
        action={notification.action}
        isVisible={notification.isVisible}
        onActionClick={handleUndoAction}
      />
    </div>
  );
};

export default CalendarApp;
