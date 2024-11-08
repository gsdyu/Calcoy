'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import TitleCalendar from '@/components/Sidebar/TitleCalendar';
import CalendarFilter from '@/components/Sidebar/CalendarFilter';
import Tasks from '@/components/Sidebar/Tasks';
import MiniCalendar from '@/components/Sidebar/MiniCalendar';
import CalendarButton from '@/components/Sidebar/CalendarButton';

const Sidebar = ({ 
  onDateSelect, 
  currentView, 
  onViewChange, 
  mainCalendarDate, 
  events, 
  onTaskComplete, 
  activeCalendar, 
  handleChangeActiveCalendar, 
  servers = [] // New prop for dynamic server instances
}) => {
  const { darkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState(null);
  const [lastNonDayView, setLastNonDayView] = useState('Month');

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

  return (
    <div className={`w-60 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex flex-col relative transition-all duration-300 h-full`}>
      <div className="flex-grow overflow-hidden">
        <TitleCalendar 
          activeCalendar={activeCalendar}
          handleChangeActiveCalendar={handleChangeActiveCalendar}
        />
        
        <MiniCalendar 
          onDateSelect={handleMiniCalendarDateSelect} 
          currentView={currentView} 
          onViewChange={onViewChange}
          selectedDate={selectedDate}
          mainCalendarDate={mainCalendarDate}
        />
        
        <CalendarFilter />
        
        <CalendarButton />

        {/* Dynamically Render Server Buttons */}
        {servers.length > 0 && (
          <div className="server-buttons mt-4">
            <h2 className="text-sm font-semibold mb-2 text-gray-600">Servers</h2>
            {servers.map((server) => (
              <button
                key={server.id}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded mt-2 hover:bg-green-700"
                onClick={() => handleChangeActiveCalendar(server.id)}
              >
                {server.name}
              </button>
            ))}
          </div>
        )}
        
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
