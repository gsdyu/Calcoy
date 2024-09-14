'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const MonthView = ({ currentDate, selectedDate, events, onDateClick, onDateDoubleClick, onEventClick, shiftDirection }) => {
  const { darkMode } = useTheme();

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  const isSameDay = (date1, date2) => {
    return date1 && date2 &&
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderEventCompact = (event) => {
    const eventColor = event.color || 'blue';

    return (
      <div 
        key={event.id}
        className={`
          text-xs mb-1 truncate cursor-pointer
          rounded-full py-1 px-2
          border border-${eventColor}-500
          bg-${eventColor}-500 bg-opacity-20 text-${eventColor}-700
          ${darkMode ? `border-${eventColor}-400 text-${eventColor}-300` : ''}
          hover:bg-opacity-30 transition-colors duration-200
        `}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
      >
        <span className={`inline-block w-2 h-2 rounded-full bg-${eventColor}-500 mr-1`}></span>
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInPrevMonth = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    
    const days = [];
    let dayCounter = 1;
    let nextMonthCounter = 1;

    for (let i = 0; i < 6 * 7; i++) {
      let dayNumber;
      let isCurrentMonth = true;

      if (i < firstDay) {
        dayNumber = daysInPrevMonth - firstDay + i + 1;
        isCurrentMonth = false;
      } else if (dayCounter <= daysInMonth) {
        dayNumber = dayCounter;
        dayCounter++;
      } else {
        dayNumber = nextMonthCounter;
        nextMonthCounter++;
        isCurrentMonth = false;
      }

      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + (isCurrentMonth ? 0 : dayCounter > daysInMonth ? 1 : -1), dayNumber);
      const isCurrentDay = isToday(date);
      const isWeekendDay = isWeekend(date);
      const isSelected = isSameDay(date, selectedDate);

      const dayEvents = events.filter(event => isSameDay(new Date(event.start_time), date));
      const displayedEvents = dayEvents.slice(0, 2);
      const additionalEventsCount = Math.max(0, dayEvents.length - 2);

      days.push(
        <div
          key={i}
          className={`border-r border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${
            isCurrentMonth ? darkMode ? 'bg-gray-800' : 'bg-white' : darkMode ? 'bg-gray-900' : 'bg-gray-100'
          } ${isWeekendDay ? darkMode ? 'bg-opacity-90' : 'bg-opacity-95' : ''} p-1 relative overflow-hidden`}
          onClick={() => isCurrentMonth && onDateClick(date)}
          onDoubleClick={() => isCurrentMonth && onDateDoubleClick(date)}
        >
          <span
            className={`inline-flex items-center justify-center w-6 h-6 text-sm 
              ${isCurrentDay ? 'bg-blue-500 text-white rounded-full' : ''}
              ${isSelected && !isCurrentDay ? darkMode ? 'bg-blue-700 text-white rounded-full' : 'bg-blue-200 rounded-full' : ''}
              ${isCurrentMonth ? darkMode ? 'text-gray-100' : 'text-gray-700' : darkMode ? 'text-gray-600' : 'text-gray-400'}
              ${isWeekendDay && !isCurrentDay && !isSelected ? darkMode ? 'text-gray-300' : 'text-gray-600' : ''}
              transition-all duration-300 ease-in-out
              ${shiftDirection === 'left' ? 'translate-x-full opacity-0' : 
                shiftDirection === 'right' ? '-translate-x-full opacity-0' : 
                'translate-x-0 opacity-100'}
            `}
          >
            {dayNumber}
          </span>
          <div className="mt-1 space-y-1 overflow-hidden" style={{ maxHeight: 'calc(100% - 24px)' }}>
            {displayedEvents.map(event => renderEventCompact(event))}
            {additionalEventsCount > 0 && (
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
                {`+${additionalEventsCount} more`}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`grid grid-cols-7 border-b border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className={`py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-400 border-r border-gray-700' : 'text-gray-600 border-r border-gray-200'}`}>
            {day}
          </div>
        ))}
      </div>
      <div className={`flex-1 grid grid-cols-7 grid-rows-6 border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {renderCalendar()}
      </div>
    </div>
  );
};

export default MonthView;