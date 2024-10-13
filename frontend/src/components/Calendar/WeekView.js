'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getWeekDays, isToday, formatHour } from '@/utils/dateUtils';

const WeekView = ({ currentDate, selectedDate, events, onDateClick, onDateDoubleClick, onEventClick, shiftDirection, onEventUpdate }) => {
  const { darkMode } = useTheme();
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };
  
  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getEventStyle = (event) => {
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    const startHour = startDate.getHours();
    const startMinute = startDate.getMinutes();
    const endHour = endDate.getHours();
    const endMinute = endDate.getMinutes();

    const top = (startHour + startMinute / 60) * 60;
    const height = ((endHour - startHour) + (endMinute - startMinute) / 60) * 60;

    return {
      top: `${top}px`,
      height: `${height}px`,
      left:  '0px',
      right: '20px',
      zIndex: 30,
    };
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hours + minutes / 60) * 60;
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

  const handleDateClick = (day) => {
    onDateClick(new Date(day));
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    onEventClick(event);
  };

  const onDragStart = (e, eventId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ eventId }));
  };

  const onDragOver = (e, dayIndex) => {
    e.preventDefault();
    setDragOverColumn(dayIndex);
  };

  const onDragLeave = () => {
    setDragOverColumn(null);
  };

  const onDrop = (e, date, hour) => {
    e.preventDefault();
    const { eventId } = JSON.parse(e.dataTransfer.getData('text/plain'));
    const newDate = new Date(date);
    newDate.setHours(hour);
    onEventUpdate(eventId, newDate);
    setDragOverColumn(null);
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
      <style>{scrollbarStyles}</style>
      
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
              onClick={() => handleDateClick(day)}
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
                ${dragOverColumn === dayIndex ? darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100 bg-opacity-30' : ''}
              `}
              onClick={() => handleDateClick(day)}
              onDoubleClick={() => {
                const clickedDate = new Date(day);
                clickedDate.setHours(0, 0, 0, 0);
                onDateDoubleClick(clickedDate, true);
              }}
              onDragOver={(e) => onDragOver(e, dayIndex)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, day, 0)}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500 opacity-20 z-10"></div>
              )}
              {events
                .filter(event => event.allDay && isSameDay(new Date(event.start_time), day))
                .map(event => (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, event.id)}
                    className="absolute left-0 right-0 bg-blue-500 text-white text-xs p-1 m-1 overflow-hidden rounded cursor-pointer hover:bg-blue-600 transition-colors duration-200 z-20"
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
        <div className="absolute top-0 left-0 w-16 h-full">
          {hours.map((hour, index) => (
            <div 
              key={hour} 
              className="absolute w-full pr-2 text-right text-xs flex items-center justify-end" 
              style={{ 
                top: `${hour * 60}px`, 
                height: '60px',
                transform: 'translateY(-50%)'
              }}
            >
              {hour === 0 ? null : formatHour(hour)}
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-16 right-0 h-full">
          {hours.map((hour, index) => (
            <div 
              key={hour} 
              className={`absolute w-full ${index < hours.length - 1 ? `border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}` : ''}`}
              style={{ top: `${hour * 60}px`, height: '60px' }}
            >
              {weekDays.map((day, dayIndex) => {
                const isWeekendDay = isWeekend(day);
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className={`absolute top-0 bottom-0 border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'} 
                      ${isWeekendDay ? darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-100 bg-opacity-50' : ''}
                      ${dragOverColumn === dayIndex ? darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100 bg-opacity-30' : ''}
                    `}
                    style={{ left: `${(100 / 7) * dayIndex}%`, width: `${100 / 7}%` }}
                    onClick={() => handleDateClick(day)}
                    onDoubleClick={() => {
                      const clickedDate = new Date(day);
                      clickedDate.setHours(hour);
                      onDateDoubleClick(clickedDate, false);
                    }}
                    onDragOver={(e) => onDragOver(e, dayIndex)}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, day, hour)}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500 opacity-20 z-10"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Current time indicator */}
        {weekDays.map((day, dayIndex) => (
          isToday(day) && (
            <div
              key={`time-indicator-${dayIndex}`}
              className="absolute left-16 right-0 z-50"
              style={{ top: `${getCurrentTimePosition()}px` }}
            >
              <div className="relative w-full">
                <div className="absolute left-0 right-0 border-t border-red-500"></div>
                <div className="absolute left-0 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1.5 -translate-y-1.5"></div>
              </div>
            </div>
          )
        ))}
        {/* Render events */}
        <div className="absolute top-0 left-16 right-0 bottom-0 pointer-events-none">
          {weekDays.map((day, dayIndex) => (
            <div key={`events-${dayIndex}`} className="absolute top-0 bottom-0" style={{ left: `${(100 / 7) * dayIndex}%`, width: `${100 / 7}%` }}>
              {events
                .filter(event => {
                  const eventDate = new Date(event.start_time);
                  return !event.allDay && isSameDay(eventDate, day);
                })
                .map(event => (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, event.id)}
                    className="absolute bg-blue-500 text-white text-xs overflow-hidden rounded cursor-pointer hover:bg-blue-600 transition-colors duration-200 border border-blue-600"
                    style={getEventStyle(event)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event, e);
                    }}
                  >
                    <div className="w-full h-full p-1 flex flex-col pointer-events-auto">
                      <div className="font-bold">{event.title}</div>
                      <div className="text-xs">
                        {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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