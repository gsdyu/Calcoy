'use client';
import { io } from 'socket.io-client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [otherCalendars, setOtherCalendars] = useState([])
  const [serverUsers, setServerUsers] = useState([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
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
  const currentUser = useRef(null);

  // Saves sidebar state if open then stay open on refresh if closed stay closed on refresh till state is changed
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('groupCalendarCollapsed');
      return saved ? !JSON.parse(saved) : false;  
    }
    return false;
  });
  
  useEffect(() => {
    localStorage.setItem('groupCalendarCollapsed', JSON.stringify(!isSidebarOpen));
  }, [isSidebarOpen]);

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
            colors: { ...itemColors, [item]: color },
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
        const checkJson = await check.json();
        //localStorage.setItem('userId', Number(checkJson.userId));
        currentUser.current=checkJson.userId;

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
  }, [displayName, activeCalendar, visibleItems]); 
  
  
    
  const showNotification = (message, action = '') => {
    setNotification({ message, action, isVisible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const getVisibility = (event, calendarType, activeCalendar) => {
    const visibleType = typeof visibleItems[calendarType]  === 'boolean' ? visibleItems[calendarType] : false;
    const visibleUser = (typeof visibleItems[`server${event.server_id}:user${event.user_id}`] === 'boolean' && activeCalendar?.id === event.server_id)? visibleItems[`server${event.server_id}:user${event.user_id}`] : false; 
    const visibleServer = (typeof visibleItems[`server${event.server_id}`]  === 'boolean' && !activeCalendar)? visibleItems[`server${event.server_id}`] : false;
    const visibleImport = typeof visibleItems[`${event.imported_from}:${event.imported_username}`] === 'boolean' ? visibleItems[`${event.imported_from}:${event.imported_username}`] : false;
    const visibleAny = (visibleType || visibleUser || visibleServer || visibleImport)

    return {visibleType, visibleUser, visibleServer, visibleImport, visibleAny}
  }

  const getEventColor = (event) => {
    const calendarType = event.calendar || 'default';
  
    //stores all the possible colors for an event first. 

    //otherColor is a dictionary; any color here can be chosen as an eventColor by calling the key
    //default eventColor: the first color added to otherColor
    const otherColor = {};
    let tempColor;


    //the bottom logic is the order of the calendar shown on the sidebar
    //if statement are for which sidebar is being shown
    const {visibleType, visibleUser, visibleServer, visibleImport, visibleAny} = getVisibility(event, calendarType, activeCalendar);
    //do not need to return all attribute since if there is no eventColor, that mean the event should not be displayed.
    //color attributes related are irrelevant then
    if (visibleAny === false) return {eventColor: null, otherColorList: null} 
    tempColor = (itemColors?.[calendarType] && visibleType) 
    ? itemColors[calendarType]
    : (() => {
        if (!visibleType) return
        switch (calendarType) {
          case 'Task':
            return itemColors?.tasks || 'bg-red-500';  
          case 'Personal':
            return itemColors?.Personal || 'bg-blue-500'; 
          case 'Family':
            return itemColors?.Family || 'bg-orange-500'; 
          case 'Birthday':
            return itemColors?.Birthday || 'bg-green-500'; 
          case 'Work':
            return 'bg-purple-500'; 
          default:
            return; 
        }
      })();
    otherColor.my=tempColor;
    if (visibleUser) {
      tempColor = itemColors?.[`server${event.server_id}:user${event.user_id}`] ? itemColors?.[`server${event.server_id}:user${event.user_id}`] : itemColors?.[`server_default`]
      otherColor.user=tempColor
  } else {
      if (visibleServer) {
        otherColor.server= itemColors?.[`server${event.server_id}`] ? itemColors?.[`server${event.server_id}`] : itemColors?.[`server_default`]
      }
      if (visibleImport) {
        otherColor.otherCalendar = itemColors?.[`${event.imported_from}:${event.imported_username}`] ? itemColors?.[`${event.imported_from}:${event.imported_username}`] : itemColors?.[`other_default`]
      }
    }

    const otherColorBGList=Object.values(otherColor).filter(color=>color!=null);
    const origColorBGList = Array.from(otherColorBGList);
    const eventColor = otherColorBGList.shift();
    const otherColorList=otherColorBGList.map(color => color.replace('bg-',''));
    console.log(eventColor, otherColorList)

    return {eventColor, otherColorList, otherColorBGList, origColorBGList}
  }
  const fetchEvents = async () => {
    console.log('Current active calendar:', activeCalendar);
  
  
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
          const calendarType = event.calendar || 'default';
          const {visibleAny} = getVisibility(event, calendarType, activeCalendar);
          return (visibleAny) ? {
            ...event,
            date: startTime.toLocaleDateString(),
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isTask: event.calendar === 'Task',
            completed: event.completed || false,
            server_id: event.server_id,
            imported_from: event.imported_from,
            imported_username: event.imported_username || event.imported_from
          } : {};
        });

        const tempOtherCalendars = [...new Set(formattedEvents.map(event=>{return ({imported_from: event.imported_from, imported_username: event.imported_username})}).filter(calendar=>calendar.imported_from!==null).map(calendar=>JSON.stringify(calendar)))].map(calendar => JSON.parse(calendar))
        if (tempOtherCalendars)
        { 
          const updatedCalendar = ([...otherCalendars,
                                    ...tempOtherCalendars.filter(temp=>{
                                      return Object.keys(temp).length>0 && !(otherCalendars.some(current=>{
                                        return (current.imported_from === temp.imported_from && current.imported_username === temp.imported_username)
                                      }))
                                  })])
          if (!(updatedCalendar.length===0)) {
            setOtherCalendars(updatedCalendar)
          }
        }
  
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
              activeCalendar={activeCalendar}
              servers={servers}
              serverUsers={serverUsers}
              getEventColor={getEventColor}
              visibleItems={visibleItems}
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
              activeCalendar={activeCalendar}
              getEventColor={getEventColor}
              visibleItems={visibleItems}
              getVisibility={getVisibility}
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
              activeCalendar={activeCalendar}
              getEventColor={getEventColor}
              visibleItems={visibleItems}
              getVisibility={getVisibility}
            />
          )}
        </div>
      </div>
      <div className="flex">
        <div className={`transition-all duration-0 ${isSidebarOpen ? 'w-60' : 'w-0'} overflow-hidden`}>
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
              onColorChange={handleColorChange}
              setServers={setServers}
              serverUsers={serverUsers}
              servers={servers}
              setServerUsers={setServerUsers}
              otherCalendars={otherCalendars}
              visibleItems={visibleItems}
              setVisibleItems={setVisibleItems}
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
          getEventColor={getEventColor}
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
