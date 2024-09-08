'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { isToday, formatHour } from '@/utils/dateUtils';

const DayView = ({ currentDate, events, onDateDoubleClick, shiftDirection }) => {
  const { darkMode } = useTheme();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventStyle = (event) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMinute = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinute = parseInt(event.endTime.split(':')[1]);

    const top = (startHour + startMinute / 60) * 60; // 60px per hour
    const height = ((endHour - startHour) + (endMinute - startMinute) / 60) * 60;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === currentDate.toDateString();
  });

  const allDayEvents = filteredEvents.filter(event => event.allDay);
  const timedEvents = filteredEvents.filter(event => !event.allDay);

  const scrollbarStyles = darkMode ? `
    .dark-scrollbar::-webkit-scrollbar {
      width: 12px;
    }
    .dark-scrollbar::-webkit-scrollbar-track {
      background: #2D3748;
    }
    .dark-scrollbar::-webkit-scrollbar-thumb {
      background-color: #4A5568;
      border-radius: 6px;
      border: 3px solid #2D3748;
    }
    .dark-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #4A5568 #2D3748;
    }
  ` : '';

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
      <style>{scrollbarStyles}</style>
      {/* Day header */}
      <div className={`text-center py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${isToday(currentDate) ? 'bg-blue-500 text-white' : ''}`}>
        <h2 className={`text-lg font-semibold
          transition-all duration-300 ease-in-out
          ${shiftDirection === 'left' ? 'translate-x-4 opacity-0' : 
            shiftDirection === 'right' ? '-translate-x-4 opacity-0' : 
            'translate-x-0 opacity-100'}
        `}>
          {currentDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>
      </div>

      {/* All-day events section */}
      <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} min-h-[40px] relative`}>
        <div className="absolute left-0 top-0 bottom-0 w-16 flex-shrink-0 text-xs pr-2 flex items-center justify-end">
          All-day
        </div>
        <div 
          className="ml-16 h-full relative"
          onDoubleClick={() => {
            const clickedDate = new Date(currentDate);
            clickedDate.setHours(0, 0, 0, 0);
            onDateDoubleClick(clickedDate, true);
          }}
        >
          {allDayEvents.map(event => (
            <div
              key={event.id}
              className="absolute left-0 right-0 bg-blue-500 text-white text-xs p-1 m-1 overflow-hidden rounded"
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div className={`flex-1 overflow-y-auto ${darkMode ? 'dark-scrollbar' : ''}`}>
        {hours.map((hour) => (
          <div key={hour} className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} min-h-[60px]`}>
            <div className="w-16 flex-shrink-0 text-right pr-2 pt-1 text-xs">
              {formatHour(hour)}
            </div>
            <div
              className="flex-1 relative"
              onDoubleClick={() => {
                const clickedDate = new Date(currentDate);
                clickedDate.setHours(hour);
                onDateDoubleClick(clickedDate, false);
              }}
            >
              {timedEvents
                .filter(event => parseInt(event.startTime.split(':')[0]) === hour)
                .map(event => (
                  <div
                    key={event.id}
                    className="absolute left-0 right-0 bg-blue-500 text-white text-xs p-1 overflow-hidden rounded"
                    style={getEventStyle(event)}
                  >
                    {event.title}
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayView;