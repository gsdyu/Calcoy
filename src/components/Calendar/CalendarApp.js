import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import GroupCalendars from '../Sidebar/GroupCalendars';
import CalendarHeader from './CalendarHeader';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import AddEditEventModal from '../Modals/AddEditEventModal';
import ProfileModal from '../Modals/ProfileModal';
import { useCalendar } from '../../hooks/useCalendar';
import { useProfile } from '../../hooks/useProfile';
import { useTheme } from '../../contexts/ThemeContext';

const CalendarApp = () => {
  const { currentDate, view, handleViewChange } = useCalendar();
  const { isProfileOpen, handleProfileOpen, handleProfileClose, displayName, profileImage } = useProfile();
  const { darkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [shiftDirection, setShiftDirection] = useState(null);

  const handleDateChange = (date, direction) => {
    setShiftDirection(direction);
    setSelectedDate(date);
    setTimeout(() => setShiftDirection(null), 300);
  };

  const handleAddEvent = (date = null) => {
    setSelectedDate(date);
    setIsAddingEvent(true);
  };

  const handleCloseModal = () => {
    setIsAddingEvent(false);
    setSelectedDate(null);
  };

  const handleSaveEvent = (newEvent) => {
    setEvents(prevEvents => [...prevEvents, { ...newEvent, id: Date.now() }]);
    setIsAddingEvent(false);
    setSelectedDate(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMiniCalendarDateSelect = (date) => {
    handleDateChange(date, 'none');
  };

  const handleMiniCalendarViewChange = (newView) => {
    handleViewChange(newView);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <GroupCalendars 
        onProfileOpen={handleProfileOpen}
        displayName={displayName}
        profileImage={profileImage}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <div className={`flex transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-0'} overflow-hidden`}>
        <Sidebar 
          onDateSelect={handleMiniCalendarDateSelect}
          currentView={view}
          onViewChange={handleMiniCalendarViewChange}
          onClose={toggleSidebar}
          mainCalendarDate={selectedDate || currentDate}
        />
      </div>
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
              events={events} 
              onDateDoubleClick={handleAddEvent}
              shiftDirection={shiftDirection}
            />
          )}
          {view === 'Week' && (
            <WeekView 
              currentDate={selectedDate || currentDate} 
              events={events} 
              onDateDoubleClick={handleAddEvent}
              shiftDirection={shiftDirection}
            />
          )}
          {view === 'Day' && (
            <DayView 
              currentDate={selectedDate || currentDate} 
              events={events} 
              onDateDoubleClick={handleAddEvent}
              shiftDirection={shiftDirection}
            />
          )}
        </div>
      </div>
      {isAddingEvent && (
        <AddEditEventModal 
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          initialDate={selectedDate}
        />
      )}
      {isProfileOpen && <ProfileModal onClose={handleProfileClose} />}
    </div>
  );
};

export default CalendarApp;