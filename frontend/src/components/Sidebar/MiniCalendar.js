'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const MiniCalendar = ({ onDateSelect, currentView, onViewChange, selectedDate, mainCalendarDate }) => {
  const { darkMode } = useTheme();
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());

  useEffect(() => {
    if (mainCalendarDate) {
      setMiniCalendarDate(new Date(mainCalendarDate));
    }
  }, [mainCalendarDate]);

  const daysInMonth = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), 1).getDay();
  const daysInPrevMonth = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), 0).getDate();

  const prevMonth = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setMiniCalendarDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setMiniCalendarDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setMiniCalendarDate(today);
    onDateSelect(today);
  };

  const handleDateClick = (day, isCurrentMonth) => {
    let newDate;
    if (isCurrentMonth) {
      newDate = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), day);
    } else {
      newDate = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + (day > 20 ? -1 : 1), day);
    }
    onDateSelect(newDate);
  };

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const renderCalendarDays = () => {
    const calendarDays = [];
    const totalDays = 42; // 6 rows * 7 days

    for (let i = 0; i < totalDays; i++) {
      if (i < firstDayOfMonth) {
        // Previous month
        const day = daysInPrevMonth - firstDayOfMonth + i + 1;
        calendarDays.push({ day, isCurrentMonth: false });
      } else if (i < firstDayOfMonth + daysInMonth) {
        // Current month
        const day = i - firstDayOfMonth + 1;
        calendarDays.push({ day, isCurrentMonth: true });
      } else {
        // Next month
        const day = i - (firstDayOfMonth + daysInMonth) + 1;
        calendarDays.push({ day, isCurrentMonth: false });
      }
    }

    return calendarDays;
  };

  const isInSelectedWeek = (day, isCurrentMonth) => {
    if (!mainCalendarDate || currentView !== 'Week') return false;
    
    const weekStart = new Date(mainCalendarDate);
    weekStart.setDate(mainCalendarDate.getDate() - mainCalendarDate.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const checkDate = new Date(
      miniCalendarDate.getFullYear(), 
      miniCalendarDate.getMonth() + (isCurrentMonth ? 0 : day > 20 ? -1 : 1), 
      day
    );
    
    // Normalize the time portion to avoid any time-of-day issues
    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);
    checkDate.setHours(12, 0, 0, 0);
    
    return checkDate >= weekStart && checkDate <= weekEnd;
  };

  // Helper function to determine if a day is at the start or end of its week
  const getWeekPosition = (index) => {
    const position = index % 7;
    return {
      isStart: position === 0,
      isEnd: position === 6
    };
  };

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold">
          {miniCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={goToToday}
            className={`p-1 rounded-full ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            title="Today"
          >
            <Calendar size={16} />
          </button>
          <button
            onClick={prevMonth}
            className={`p-1 rounded-full ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className={`p-1 rounded-full ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, index) => (
          <div key={`${day}:${index}`} className="text-center text-xs font-medium">{day}</div>
        ))}
        {renderCalendarDays().map(({ day, isCurrentMonth }, index) => {
          const isSelected = mainCalendarDate && 
                             mainCalendarDate.getDate() === day && 
                             mainCalendarDate.getMonth() === miniCalendarDate.getMonth() &&
                             mainCalendarDate.getFullYear() === miniCalendarDate.getFullYear() &&
                             isCurrentMonth;
          const isToday = new Date().getDate() === day && 
                          new Date().getMonth() === miniCalendarDate.getMonth() && 
                          new Date().getFullYear() === miniCalendarDate.getFullYear() &&
                          isCurrentMonth;
          const isInWeek = isInSelectedWeek(day, isCurrentMonth);
          const { isStart, isEnd } = getWeekPosition(index);
          
          return (
            <div 
              key={index} 
              onClick={() => handleDateClick(day, isCurrentMonth)}
              className={`relative text-center p-1 text-xs cursor-pointer
                ${isCurrentMonth ? '' : 'text-gray-500'}
                ${isInWeek ? `${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
                  ${isStart ? 'rounded-l-2xl' : ''}
                  ${isEnd ? 'rounded-r-2xl' : ''}
                ` : ''}
              `}
            >
              <div className={`
                absolute inset-0 rounded-full
                ${isToday ? 'bg-blue-500' : ''}
                ${isSelected && !isToday ? 'bg-gray-400' : ''}
                hover:bg-opacity-50 hover:bg-gray-400
                transition-colors duration-200
              `}></div>
              <span className={`
                relative z-10
                ${isToday ? 'text-white' : ''}
                ${isSelected && !isToday ? 'text-white' : ''}
              `}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
