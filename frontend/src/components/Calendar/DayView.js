'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { isToday, formatHour } from '@/utils/dateUtils';
import { ChevronDown, Check } from 'lucide-react';

const DayView = ({ currentDate, events, onDateDoubleClick, onEventClick, shiftDirection }) => {
  const { darkMode } = useTheme();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAllDayExpanded, setIsAllDayExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const isAllDayEvent = (event) => {
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    return startDate.getHours() === 0 && startDate.getMinutes() === 0 &&
           endDate.getHours() === 23 && endDate.getMinutes() === 59 &&
           startDate.getDate() === endDate.getDate() &&
           startDate.getMonth() === endDate.getMonth() &&
           startDate.getFullYear() === endDate.getFullYear();
  };

  const getEventStyle = (event) => {
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    const startHour = startDate.getHours();
    const startMinute = startDate.getMinutes();
    const endHour = endDate.getHours();
    const endMinute = endDate.getMinutes();

    const top = (startHour + startMinute / 60) * 60;
    const height = event.calendar === 'Task' ? 30 : ((endHour - startHour) + (endMinute - startMinute) / 60) * 60;

    return {
      top: `${top}px`,
      height: `${height}px`,
      left: '0',
      right: '20px',
      zIndex: 10, // Ensure events are above the grid
    };
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hours + minutes / 60) * 60;
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate.toDateString() === currentDate.toDateString();
  });

  const allDayEvents = filteredEvents.filter(event => isAllDayEvent(event));
  const timedEvents = filteredEvents.filter(event => !isAllDayEvent(event));

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    onEventClick(event);
  };

  const handleDateDoubleClick = (date, isAllDay, e) => {
    e.preventDefault();
    onDateDoubleClick(date, isAllDay);
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

  const renderAllDayEvent = (event) => {
    const eventColor = event.color || 'blue';
    const isTask = event.calendar === 'Task';
    const isCompleted = event.completed;

    if (isTask) {
      return (
        <div
          key={event.id}
          className={`
            flex justify-between items-center
            text-xs mb-1 truncate cursor-pointer
            rounded-full py-1 px-2
            ${isCompleted ? 'opacity-50' : ''}
            border border-${eventColor}-500 bg-${eventColor}-500 bg-opacity-20 text-${eventColor}-700
            ${darkMode ? `border-${eventColor}-400 text-${eventColor}-300` : ''}
            hover:bg-opacity-30 transition-colors duration-200 z-40
            mr-5
            ${isCompleted ? 'line-through' : ''}
          `}
          onClick={(e) => handleEventClick(event, e)}
          style={{ position: 'relative', zIndex: 40 }}
        >
          <div className="flex items-center overflow-hidden">
            <Check 
              className={`w-3 h-3 mr-1 flex-shrink-0
                ${isCompleted ? 'opacity-50' : ''} 
                ${darkMode 
                  ? `text-${eventColor}-400` 
                  : `text-${eventColor}-500`
                }`} 
            />
            <span className={`truncate ${isCompleted ? 'line-through' : ''}`}>
              {event.title}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={event.id}
        className={`
          flex justify-between items-center
          text-xs mb-1 truncate cursor-pointer
          rounded-full py-1 px-2
          bg-${eventColor}-500 text-white
          hover:bg-opacity-80 transition-colors duration-200 z-40
          mr-5
        `}
        onClick={(e) => handleEventClick(event, e)}
        style={{ position: 'relative', zIndex: 40 }}
      >
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  const renderAllDayEvents = () => {
    const maxVisibleEvents = 3;
    const visibleCount = isAllDayExpanded 
      ? allDayEvents.length 
      : (allDayEvents.length <= maxVisibleEvents ? allDayEvents.length : 2);
    const hiddenCount = allDayEvents.length - visibleCount;
  
    const sortedEvents = [...allDayEvents].sort((a, b) => {
      if (a.calendar === 'Task' && b.calendar === 'Task') {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
      }
      return 0;
    });

    return (
      <div className={`
        transition-all duration-300 ease-in-out origin-top
        ${isAllDayExpanded 
          ? 'opacity-100 scale-y-100' 
          : 'opacity-95 scale-y-95'
        }
      `}>
        {sortedEvents.slice(0, visibleCount).map(renderAllDayEvent)}
        {!isAllDayExpanded && allDayEvents.length > maxVisibleEvents && (
          <div 
            className="text-xs cursor-pointer text-blue-500 hover:text-blue-600"
            onClick={() => setIsAllDayExpanded(true)}
          >
            +{hiddenCount} more
          </div>
        )}
      </div>
    );
  };

  const toggleAllDayExpansion = () => {
    setIsAllDayExpanded(!isAllDayExpanded);
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
      <style>{scrollbarStyles}</style>
      
      {/* Compact, Centered Day header */}
      <div className={`flex justify-center items-center py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`flex items-center ${isToday(currentDate) ? 'bg-blue-500' : darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full px-4 py-1`}>
          <span className="text-3xl font-bold mr-2">{currentDate.getDate()}</span>
          <span className="text-lg">{currentDate.toLocaleString('default', { weekday: 'long' })}</span>
        </div>
      </div>

      {/* All-day events section */}
      <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} min-h-[40px] relative flex`}>
        <div className="w-16 flex-shrink-0 text-xs pr-2 flex flex-col items-end justify-between py-1">
          <span>All-day</span>
          {allDayEvents.length > 3 && (
            <button 
              className="text-blue-500 hover:text-blue-600"
              onClick={toggleAllDayExpansion}
            >
              <ChevronDown 
                size={16} 
                className={`transform transition-transform duration-400 ${
                  isAllDayExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
        <div className={`w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        <div 
          className="flex-grow relative p-1"
          onDoubleClick={(e) => handleDateDoubleClick(new Date(currentDate), true, e)}
        >
          {renderAllDayEvents()}
        </div>
      </div>

      {/* Time slots */}
      <div className={`flex-1 overflow-y-auto ${darkMode ? 'dark-scrollbar' : ''} relative`}>
        <div className="flex" style={{ height: '1440px' }}> {/* 24 hours * 60px per hour */}
          {/* Time column */}
          <div className="w-16 flex-shrink-0 relative">
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="absolute w-full pr-2 text-right text-xs flex items-center justify-end" 
                style={{ 
                  top: `${hour * 60}px`, 
                  height: '60px',
                  transform: 'translateY(-50%)'  // This centers the text vertically
                }}
              >
                {hour === 0 ? null : formatHour(hour)}
              </div>
            ))}
          </div>
          
          {/* Separator line */}
          <div className={`w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} style={{ height: '1440px' }}></div>

          {/* Events area */}
          <div className="flex-grow relative" style={{ height: '1440px' }}>
            {hours.map((hour, index) => (
              <div 
                key={hour} 
                className={`absolute w-full ${index < hours.length - 1 ? `border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}` : ''}`} 
                style={{ top: `${hour * 60}px`, height: '60px' }}
                onDoubleClick={(e) => {
                  const clickedDate = new Date(currentDate);
                  clickedDate.setHours(hour);
                  handleDateDoubleClick(clickedDate, false, e);
                }}
              ></div>
            ))}
            {timedEvents.map(event => {
              if (event.calendar === 'Task') {
                const eventColor = event.color || 'blue';
                const startTime = new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={event.id}
                    className={`
                      absolute text-xs overflow-hidden cursor-pointer
                      rounded-full py-1 px-2
                      ${event.completed ? 'opacity-50' : ''}
                      border border-${eventColor}-500 bg-${eventColor}-500 bg-opacity-20 text-${eventColor}-700
                      ${darkMode ? `border-${eventColor}-400 text-${eventColor}-300` : ''}
                      hover:bg-opacity-30 transition-colors duration-200
                      ${event.completed ? 'line-through' : ''}
                    `}
                    style={getEventStyle(event)}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center overflow-hidden">
                        <Check 
                          className={`w-3 h-3 mr-1 flex-shrink-0
                            ${event.completed ? 'opacity-50' : ''} 
                            ${darkMode 
                              ? `text-${eventColor}-400` 
                              : `text-${eventColor}-500`
                            }`} 
                        />
                        <span className="truncate">{event.title}</span>
                      </div>
                      <span className="ml-2 text-[10px]">{startTime}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={event.id}
                  className="absolute bg-blue-500 text-white text-xs overflow-hidden rounded cursor-pointer hover:bg-blue-600 transition-colors duration-200 border border-blue-600"
                  style={getEventStyle(event)}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  <div className="w-full h-full p-1 flex flex-col pointer-events-auto">
                    <div className="font-bold">{event.title}</div>
                    <div className="text-xs">
                      {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Current time indicator */}
            {isToday(currentDate) && (
              <div
                className="absolute left-0 right-0 z-20"
                style={{ top: `${getCurrentTimePosition()}px` }}
              >
                <div className="relative w-full">
                  <div className="absolute left-0 right-0 border-t border-red-500"></div>
                  <div className="absolute left-0 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1.5 -translate-y-1.5"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;