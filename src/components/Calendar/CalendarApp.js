import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import GroupCalendars from '../Sidebar/GroupCalendars';
import CalendarHeader from './CalendarHeader';
import MonthView from './MonthView';
import WeekView from './WeekView';
import AddEditEventModal from '../Modals/AddEditEventModal';
import ProfileModal from '../Modals/ProfileModal';
import { useCalendar } from '../../hooks/useCalendar';
import { useProfile } from '../../hooks/useProfile';
import { useTheme } from '../../contexts/ThemeContext';

const CalendarApp = () => {
  const { currentDate, view, handleDateChange, handleViewChange } = useCalendar();
  const { isProfileOpen, handleProfileOpen, handleProfileClose, displayName, profileImage } = useProfile();
  const { darkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleAddEvent = () => {
    setIsAddingEvent(true);
  };

  const handleCloseModal = () => {
    setIsAddingEvent(false);
  };

  const handleSaveEvent = (newEvent) => {
    setEvents(prevEvents => [...prevEvents, { ...newEvent, id: Date.now() }]);
    setIsAddingEvent(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <GroupCalendars />
      <Sidebar 
        onProfileOpen={handleProfileOpen}
        displayName={displayName}
        profileImage={profileImage}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarHeader 
          currentDate={currentDate}
          view={view}
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
          onAddEvent={handleAddEvent}
        />
        <div className="flex-1 overflow-auto">
          {view === 'Month' ? (
            <MonthView currentDate={currentDate} events={events} />
          ) : (
            <WeekView currentDate={currentDate} events={events} />
          )}
        </div>
      </div>
      {isAddingEvent && (
        <AddEditEventModal 
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
        />
      )}
      {isProfileOpen && <ProfileModal onClose={handleProfileClose} />}
    </div>
  );
};

export default CalendarApp;