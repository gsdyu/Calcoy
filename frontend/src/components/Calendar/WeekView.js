'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getWeekDays, isToday, formatHour } from '@/utils/dateUtils';

const WeekView = ({ currentDate, selectedDate, events, onDateClick, onDateDoubleClick, onEventClick, shiftDirection }) => {
  const { darkMode } = useTheme();
  
  // Ensure currentDate is a valid Date object and set to the start of the week
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  };
  
  const weekStart = getWeekStart(currentDate);
  const weekDays = getWeekDays(weekStart);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

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
      left: '0',
      right: '0',
      zIndex: 10, // Ensure events are above the grid
    };
  };

  const formatWeekHeader = () => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    const firstMonth = firstDay.toLocaleString('default', { month: 'short' });
    const lastMonth = lastDay.toLocaleString('default', { month: 'short' });
    const year = lastDay.getFullYear();

    if (firstMonth === lastMonth) {
      return `${firstMonth} ${year}`;
    } else {
      return `${firstMonth} - ${lastMonth} ${year}`;
    }
  };

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

  const isSameDay = (date1, date2) => {
    return date1 && date2 &&
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    onEventClick(event);
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
      <style>{scrollbarStyles}</style>
      {/* Week header */}
      <div className={`text-center py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold
          transition-all duration-300 ease-in-out
          ${shiftDirection === 'left' ? 'translate-x-4 opacity-0' : 
            shiftDirection === 'right' ? '-translate-x-4 opacity-0' : 
            'translate-x-0 opacity-100'}
        `}>
          {formatWeekHeader()}
        </h2>
      </div>
      
      {/* Header row with days */}
      <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="w-16 flex-shrink-0"></div>
        {weekDays.map((day, index) => {
          const isWeekendDay = isWeekend(day);
          const isSelected = isSameDay(day, selectedDate);
          return (
            <div 
              key={index} 
              className={`flex-1 text-center py-2 ${isWeekendDay ? darkMode ? 'bg-gray-800' : 'bg-gray-100' : ''}`}
              onClick={() => onDateClick(day)}
            >
              <div className={isWeekendDay ? darkMode ? 'text-gray-400' : 'text-gray-600' : ''}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}
              </div>
              <div className={`flex items-center justify-center w-8 h-8 mx-auto 
                ${isToday(day) ? 'bg-blue-500 text-white' : ''}
                ${isSelected && !isToday(day) ? darkMode ? 'bg-blue-700' : 'bg-blue-200' : ''}
                ${isWeekendDay && !isToday(day) && !isSelected ? darkMode ? 'text-gray-300' : 'text-gray-600' : ''}
                rounded-full
              `}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events row */}
      <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} min-h-[40px]`}>
        <div className="w-16 flex-shrink-0 text-xs pr-2 flex items-center justify-end">All-day</div>
        {weekDays.map((day, dayIndex) => {
          const isWeekendDay = isWeekend(day);
          const isSelected = isSameDay(day, selectedDate);
          return (
            <div
              key={`all-day-${dayIndex}`}
              className={`flex-1 border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'} relative
                ${isWeekendDay ? darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-100 bg-opacity-50' : ''}
                ${isSelected ? darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-100 bg-opacity-20' : ''}
              `}
              onClick={() => onDateClick(day)}
              onDoubleClick={() => {
                const clickedDate = new Date(day);
                clickedDate.setHours(0, 0, 0, 0); // Set to midnight for all-day events
                onDateDoubleClick(clickedDate, true); // Pass true to indicate it's an all-day event
              }}
            >
              {events
                .filter(event => event.allDay && isSameDay(new Date(event.date), day))
                .map(event => (
                  <div
                    key={event.id}
                    className="absolute left-0 right-0 bg-blue-500 text-white text-xs p-1 m-1 overflow-hidden rounded cursor-pointer hover:bg-blue-600 transition-colors duration-200"
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    {event.title}
                  </div>
                ))
              }
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      <div className={`flex-1 overflow-y-auto ${darkMode ? 'dark-scrollbar' : ''} relative`}>
        {hours.map((hour) => (
          <div key={hour} className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} min-h-[60px]`}>
            <div className="w-16 flex-shrink-0 text-right pr-2 pt-1 text-xs">
              {formatHour(hour)}
            </div>
            {weekDays.map((day, dayIndex) => {
              const isWeekendDay = isWeekend(day);
              const isSelected = isSameDay(day, selectedDate);
              return (
                <div
                  key={`${hour}-${dayIndex}`}
                  className={`flex-1 border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'} relative 
                    ${isWeekendDay ? darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-100 bg-opacity-50' : ''}
                    ${isSelected ? darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-100 bg-opacity-20' : ''}
                  `}
                  onClick={() => onDateClick(day)}
                  onDoubleClick={() => {
                    const clickedDate = new Date(day);
                    clickedDate.setHours(hour);
                    onDateDoubleClick(clickedDate, false); // Pass false to indicate it's not an all-day event
                  }}
                >
                  {/* This div is intentionally left empty to allow double-clicking for new events */}
                </div>
              );
            })}
          </div>
        ))}
        {/* Render events in a separate layer */}
        <div className="absolute top-0 left-16 right-0 bottom-0 pointer-events-none">
          {weekDays.map((day, dayIndex) => (
            <div key={`events-${dayIndex}`} className="absolute top-0 bottom-0" style={{ left: `${(100 / 7) * dayIndex}%`, width: `${100 / 7}%` }}>
              {events
                .filter(event => {
                  const eventDate = new Date(event.date);
                  return !event.allDay &&
                         isSameDay(eventDate, day);
                })
                .map(event => (
                  <div
                    key={event.id}
                    className="absolute bg-blue-500 text-white text-xs overflow-hidden rounded cursor-pointer hover:bg-blue-600 transition-colors duration-200"
                    style={getEventStyle(event)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event, e);
                    }}
                  >
                    <div className="w-full h-full p-1 flex flex-col justify-between pointer-events-auto">
                      <div className="font-bold">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;