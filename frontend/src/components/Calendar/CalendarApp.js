'use client';
import { io } from 'socket.io-client';

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
  const [isSaving, setIsSaving] = useState(false);

  const [events, setEvents] = useState([]);
  const [servers, setServers] = useState([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [shiftDirection, setShiftDirection] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', action: '', isVisible: false });
  const [lastUpdatedEvent, setLastUpdatedEvent] = useState(null);
  const [itemColors, setItemColors] = useState({});
  const [visibleItems, setVisibleItems] = useState({});
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [eventModalTriggerRect, setEventModalTriggerRect] = useState(null);
  const [socketConnect, setSocketConnect] = useState(false);
  useEffect(() => {
    let socket = null
    if (!socketConnect) { 
      socket = io('http://localhost:5000');
      socket.removeAllListeners();
      socket.on('eventCreated', (event) => {
        const eventList = Array.isArray(event) ? event : [event]
        setEvents((prevEvents) => [...prevEvents, ...eventList]);
      });
      
      socket.on('eventUpdated', (updatedEvent) => {
        setEvents((prevEvents) =>
          prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        );
      });
      
      socket.on('eventDeleted', ({ eventId }) => {
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
      });
    }

    return () => {
      if (socket) {
        socket.off('eventCreated');
        socket.off('eventUpdated');
        socket.off('eventDeleted');
      }
      setSocketConnect(false);
    };
  }, [socketConnect, setSocketConnect]);
  
  // New useEffect for loading preferences at app initialization
  useEffect(() => {
    
    const fetchPreferences = async () => {
      try {
        const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
          credentials: 'include',
        });
        if (!check.ok) {
          console.error('No token found. Please login.');
          setPreferencesLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        if (data.preferences?.colors) {
          setItemColors(data.preferences.colors);
        }
        
        if (data.preferences?.visibility) {
          setVisibleItems(data.preferences.visibility);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setPreferencesLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  useEffect(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    setSelectedWeekStart(weekStart);
    setSelectedDate(today);

    fetchEvents();
  }, [displayName, activeCalendar]); 
  
  
    
  const showNotification = (message, action = '') => {
    setNotification({ message, action, isVisible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const handleColorChange = async (item, color) => {
    // Update UI immediately
    setItemColors(prevColors => ({ ...prevColors, [item]: color }));
    
    // Save to server in background
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          preferences: {
            visibility: visibleItems,
            colors: { ...itemColors, [item]: color }
          }
        }),
      });
      
      if (!response.ok) {
        // If save fails, revert the change
        setItemColors(prevColors => ({ ...prevColors, [item]: prevColors[item] }));
        throw new Error('Failed to save color preference');
      }
    } catch (error) {
      console.error('Error saving color preference:', error);
      showNotification('Failed to save color preference');
    }
  };
  const fetchEvents = async () => {
    console.log('Current active calendar:', activeCalendar);
  
    const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
      credentials: 'include',
    });
    if (!check.ok) return;
  
    try {
      const url = activeCalendar !== null 
        ? `${process.env.NEXT_PUBLIC_SERVER_URL}/events?server_id=${activeCalendar.id}` 
        : `${process.env.NEXT_PUBLIC_SERVER_URL}/events`;
      
      const response = await fetch(url, {
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
            isTask: event.calendar === 'Task',
            completed: event.completed || false,
            server_id: event.server_id
          };
        });
  
        setEvents(formattedEvents);
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

  const handleEventClick = (event, e) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    
    setSelectedEvent(event);
    setEventModalTriggerRect(rect);
    setIsEventDetailsOpen(true);
  };

  const handleCloseEventDetails = () => {
    setIsEventDetailsOpen(false);
    setSelectedEvent(null);
    setEventModalTriggerRect(null);
  };

  const handleEditFromDetails = () => {
    setIsEventDetailsOpen(false);
    setIsAddingEvent(true);
  };
 

  const handleCloseModal = () => {
    setIsAddingEvent(false);
    setSelectedEvent(null);
  };

  // handle task completion
  const handleTaskComplete = async (taskId, completed) => {
    const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
      credentials: 'include',
    });
    if (!check.ok) return;
  
    try {
      const eventToUpdate = events.find(event => event.id === taskId);
      if (!eventToUpdate) return;
  
      const updatedEvent = {
        ...eventToUpdate,
        completed
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/events/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedEvent),
      });
  
      if (response.ok) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === taskId ? { ...event, completed } : event
          )
        );
        showNotification(`Task marked as ${completed ? 'completed' : 'uncompleted'}`);
        handleCloseEventDetails();
  
        // not implemented yet
        //socket.emit('taskCompleted', { taskId, completed });
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showNotification('Failed to update task');
    }
  };
  const handleSaveEvent = async (event) => {
    const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
      credentials: 'include',
    });
    if (!check.ok) return;
  
    const isTask = event.calendar === 'Task';
    showNotification(`Saving ${isTask ? 'task' : 'event'}...`);
  
    try {
      const method = event.id ? 'PUT' : 'POST';
      const url = event.id ? `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${event.id}` : `${process.env.NEXT_PUBLIC_SERVER_URL}/events`;
  
      const eventData = {
        ...event,
        server_id: activeCalendar?.id || null,
        include_in_personal: event.include_in_personal ?? true,
      };
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });
  
      if (response.ok) {
        const savedEventResponse = await response.json();
        const savedEvent = savedEventResponse.event;
  
        if (savedEvent) {
          setEvents((prevEvents) => {
            // Prevent duplicates by ensuring no other event has the same ID
            if (prevEvents.some(e => e.id === savedEvent.id)) {
              return prevEvents;
            }
            if (event.id) {
              return prevEvents.map((e) => (e.id === event.id ? savedEvent : e));
            } else {
              return [...prevEvents, savedEvent];
            }
          });
  
          showNotification(`${isTask ? 'Task' : 'Event'} saved successfully`, 'Undo');
  
          // Emit WebSocket event only after saving completes
          //socket.emit(event.id ? 'eventUpdated' : 'eventCreated', savedEvent);
        } else {
          throw new Error('Response did not include event data');
        }
      } else {
        throw new Error(`Failed to save ${isTask ? 'task' : 'event'}`);
      }
    } catch (error) {
      console.error(`Error saving ${isTask ? 'task' : 'event'}:`, error);
      showNotification(`Failed to save ${isTask ? 'task' : 'event'}`);
    }
  };
  
 

  const handleDeleteEvent = async (eventId) => {
    const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
      credentials: 'include',
    });
    if (!check.ok) return;
  
    const eventToDelete = events.find(e => e.id === eventId);
    const isTask = eventToDelete?.calendar === 'Task';
    showNotification(`Deleting ${isTask ? 'task' : 'event'}...`);
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
  
      if (response.ok) {
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
        showNotification(`${isTask ? 'Task' : 'Event'} deleted successfully`, 'Undo');
  
      } else {
        throw new Error(`Failed to delete ${isTask ? 'task' : 'event'}`);
      }
    } catch (error) {
      console.error(`Error deleting ${isTask ? 'task' : 'event'}:`, error);
      showNotification(`Failed to delete ${isTask ? 'task' : 'event'}`);
    }
  };
  

  const handleEventUpdate = async (eventId, newDate, newTime) => {
    const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
      credentials: 'include',
    });
    if (!check.ok) return;
  
    const eventToUpdate = events.find(event => event.id === eventId);
    if (!eventToUpdate) return;
  
    const isTask = eventToUpdate.calendar === 'Task';
    showNotification(`Updating ${isTask ? 'task' : 'event'}...`);
  
    try {
      setLastUpdatedEvent({ ...eventToUpdate });
  
      const startTime = new Date(eventToUpdate.start_time);
      const endTime = new Date(eventToUpdate.end_time);
      const duration = endTime - startTime;
  
      // Create new start time with the updated date and time
      const newStartTime = new Date(newDate);
      if (newTime) {
        newStartTime.setHours(newTime.hours);
        newStartTime.setMinutes(newTime.minutes);
      } else {
        newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
      }
  
      // Calculate new end time while preserving the event duration
      const newEndTime = new Date(newStartTime.getTime() + duration);
  
      const updatedEvent = {
        ...eventToUpdate,
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString(),
      };
  
      // Update the events state to reflect the new start and end times locally
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? {
                ...updatedEvent,
                date: newStartTime.toLocaleDateString(),
                startTime: newStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endTime: newEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isTask: eventToUpdate.calendar === 'Task',
                completed: eventToUpdate.completed || false,
              }
            : event
        )
      );
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedEvent),
      });
  
      if (response.ok) {
        const savedEvent = await response.json();
        showNotification(`${isTask ? 'Task' : 'Event'} updated`, 'Undo');
  
      } else {
        throw new Error(`Failed to update ${isTask ? 'task' : 'event'}`);
      }
    } catch (error) {
      console.error(`Error updating ${isTask ? 'task' : 'event'}:`, error);
      showNotification(`Failed to update ${isTask ? 'task' : 'event'}`);
      fetchEvents();
    }
  };
  

  const handleUndoAction = async () => {
    if (lastUpdatedEvent) {
      const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
        credentials: 'include',
      });
      if (!check.ok) return;

      const isTask = lastUpdatedEvent.calendar === 'Task';

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/events/${lastUpdatedEvent.id}`, {
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
          showNotification(`${isTask ? 'Task' : 'Event'} reverted successfully`);
        } else {
          throw new Error(`Failed to undo ${isTask ? 'task' : 'event'} update`);
        }
      } catch (error) {
        console.error(`Error undoing ${isTask ? 'task' : 'event'} update:`, error);
        showNotification(`Failed to undo ${isTask ? 'task' : 'event'} update`);
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

  const handleChangeActiveCalendar = (server) => {
    setActiveCalendar(server); // Set the active calendar based on the clicked item
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
              itemColors={itemColors}
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
              itemColors={itemColors}
            />
          )}
          {view === 'Day' && (
            <DayView 
              currentDate={selectedDate || currentDate} 
              events={events} 
              onDateDoubleClick={handleAddEvent}
              onEventClick={handleEventClick}
              shiftDirection={shiftDirection}
              onEventUpdate={handleEventUpdate}
              itemColors={itemColors}
            />
          )}
        </div>
      </div>
      <div className="flex">
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-0'} overflow-hidden`}>
          {isSidebarOpen && !preferencesLoading && (
            <Sidebar 
              onDateSelect={handleMiniCalendarDateSelect}
              currentView={view}
              onViewChange={handleViewChange}
              onClose={toggleSidebar}
              mainCalendarDate={selectedDate || currentDate}
              events={events}
              onTaskComplete={handleTaskComplete}
              activeCalendar={activeCalendar}
              handleChangeActiveCalendar={handleChangeActiveCalendar}
              itemColors={itemColors}
              setServers={setServers}
              onColorChange={handleColorChange}
            />
          )}
        </div>
        <GroupCalendars 
          onProfileOpen={handleProfileOpen}
          displayName={displayName}
          profileImage={profileImage}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          fetchEvents={fetchEvents}
          activeCalendar={activeCalendar}
          setActiveCalendar={setActiveCalendar} 
          handleChangeActiveCalendar={handleChangeActiveCalendar}
          servers={servers}
          setServers={setServers}
        />
        
      </div>
      {isEventDetailsOpen && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={handleCloseEventDetails}
          onEdit={handleEditFromDetails}
          onDelete={handleDeleteEvent}
          onTaskComplete={handleTaskComplete}
          triggerRect={eventModalTriggerRect}  
          view={view}
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
