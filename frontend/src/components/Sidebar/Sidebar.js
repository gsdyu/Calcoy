'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import TitleCalendar from '@/components/Sidebar/TitleCalendar';
import CalendarFilter from '@/components/Sidebar/CalendarFilter';
import Tasks from '@/components/Sidebar/Tasks';
import MiniCalendar from '@/components/Sidebar/MiniCalendar';

const Sidebar = ({ 
  onDateSelect, 
  currentView, 
  onViewChange, 
  mainCalendarDate, 
  events, 
  onTaskComplete, 
  activeCalendar, 
  handleChangeActiveCalendar, 
  itemColors, 
  onColorChange, 
  servers, 
  setServers, 
  serverUsers, 
  setServerUsers, 
  otherCalendars
}) => {
  const { darkMode, selectedTheme, presetThemes } = useTheme();
  const [selectedDate, setSelectedDate] = useState(null);
  const [lastNonDayView, setLastNonDayView] = useState('Month');

  const onLeave = async (serverId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${serverId}/leave`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setServers((prev) => prev.filter((server) => server.id !== serverId));
        handleChangeActiveCalendar(null);
      } else {
        console.error('Failed to leave server');
      }
    } catch (error) {
      console.error('Error leaving server:', error);
    }
  };

  const handleMiniCalendarDateSelect = (date) => {
    const isSameDate = selectedDate && selectedDate.getTime() === date.getTime();

    if (currentView !== 'Day') {
      setLastNonDayView(currentView);
    }

    if (currentView === 'Week' && !isSameDate) {
      setSelectedDate(date);
      onDateSelect(date);
    } else if (isSameDate) {
      if (currentView === 'Day') {
        onViewChange(lastNonDayView);
      } else {
        onViewChange('Day');
      }
    } else {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  // Combine theme gradient with original color scheme
  const backgroundClasses = `
    ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
    ${selectedTheme && presetThemes[selectedTheme]?.gradient}
    ${selectedTheme ? 'bg-opacity-95' : ''}
  `;

  return (
    <div className={`w-60 ${backgroundClasses} flex flex-col relative transition-all duration-300 h-full`}>
      <div className="flex-grow overflow-hidden">
        <TitleCalendar 
          activeCalendar={activeCalendar}
          handleChangeActiveCalendar={handleChangeActiveCalendar}
          onLeave={onLeave}
        />
        
        <MiniCalendar 
          onDateSelect={handleMiniCalendarDateSelect} 
          currentView={currentView} 
          onViewChange={onViewChange}
          selectedDate={selectedDate}
          mainCalendarDate={mainCalendarDate}
        />
        
        <CalendarFilter 
          onColorChange={onColorChange}
          itemColors={itemColors}
          activeServer={activeCalendar}
          servers={servers}
          setServers={setServers}
          serverUsers={serverUsers}
          setServerUsers={setServerUsers}
          otherCalendars={otherCalendars}
        />
        
        <Tasks 
          events={events}
          selectedDate={selectedDate || mainCalendarDate}
          onTaskComplete={onTaskComplete}
        />
      </div>
    </div>
  );
};

export default Sidebar;