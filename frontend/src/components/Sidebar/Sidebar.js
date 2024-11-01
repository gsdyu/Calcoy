'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import TitleCalendar from '@/components/Sidebar/TitleCalendar';
import CalendarFilter from '@/components/Sidebar/CalendarFilter';
import Tasks from '@/components/Sidebar/Tasks';
import MiniCalendar from '@/components/Sidebar/MiniCalendar';

const Sidebar = ({ onDateSelect, currentView, onViewChange, mainCalendarDate, events, onTaskComplete, activeCalendar, handleChangeActiveCalendar, itemColors, onColorChange}) => {
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
        <CalendarFilter 
        onColorChange={onColorChange}
        itemColors={itemColors}
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
