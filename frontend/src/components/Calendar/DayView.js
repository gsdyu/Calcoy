'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { isToday, formatHour } from '@/utils/dateUtils';
import { ChevronDown, Check } from 'lucide-react';
import { useCalendarDragDrop } from '@/hooks/useCalendarDragDrop';
import { handleTimeSlotDoubleClick } from '@/utils/timeSlotUtils';
import { calculateEventColumns } from '@/utils/calendarPositioningUtils';
import holidayService from '@/utils/holidayUtils';

const DayView = ({ currentDate, events, onDateDoubleClick, onEventClick, shiftDirection, onEventUpdate, itemColors, getEventColor }) => {
  const { darkMode } = useTheme();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAllDayExpanded, setIsAllDayExpanded] = useState(false);
  const [eventPositions, setEventPositions] = useState(new Map());
  const [holidays, setHolidays] = useState([]);
  
  // New state for filtered events
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [allDayEvents, setAllDayEvents] = useState([]);
  const [timedEvents, setTimedEvents] = useState([]);

  // Initialize drag and drop hook
  const { 
    draggedEvent,
    dropPreview,
    getDragHandleProps,
    getDropTargetProps,
  } = useCalendarDragDrop({ 
    onEventUpdate, 
    darkMode,
    view: 'day',
    cellHeight: 60,
    shouldAllowDrag: (event) => !event.isHoliday
  });

  // Holiday fetching effect
  useEffect(() => {
    const monthHolidays = holidayService.getMonthHolidays(currentDate);
    setHolidays(monthHolidays);
  }, [currentDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Event filtering effect
  useEffect(() => {
    const newFilteredEvents = [...events, ...holidays].filter(event => 
      shouldShowEventOnDay(event, currentDate)
    );
    
    setFilteredEvents(newFilteredEvents);
    setAllDayEvents(newFilteredEvents.filter(event => isAllDayEvent(event)));
    setTimedEvents(newFilteredEvents.filter(event => !isAllDayEvent(event)));

    const positions = calculateEventColumns(
      newFilteredEvents.filter(event => !isAllDayEvent(event))
    );
    setEventPositions(positions);
  }, [events, holidays, currentDate]);

  const isEventCrossingMidnight = (event) => {
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    
    const nextDay = new Date(startDate);
    nextDay.setDate(startDate.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    
    return endDate.getTime() > nextDay.getTime();
  };

  const shouldShowEventOnDay = (event, day) => {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const nextDayStart = new Date(dayStart);
    nextDayStart.setDate(nextDayStart.getDate() + 1);

    // If this is an event ending at midnight exactly
    if (eventEnd.getHours() === 0 && eventEnd.getMinutes() === 0) {
      return eventStart <= dayEnd && eventEnd.getTime() !== dayStart.getTime();
    }

    // For regular events
    return eventStart <= dayEnd && eventEnd > dayStart;
  };

  const isAllDayEvent = (event) => {
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    
    // Check if event starts at midnight (00:00)
    const startsAtMidnight = startDate.getHours() === 0 && startDate.getMinutes() === 0;
    
    // Check if event ends at midnight of the next day
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return startsAtMidnight && endDate.getTime() === nextDay.getTime();
  };

  const getEventStyle = (event, isNextDay = false) => {
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    
    let startHour = isNextDay ? 0 : startDate.getHours();
    let startMinute = isNextDay ? 0 : startDate.getMinutes();
    let endHour = endDate.getHours();
    let endMinute = endDate.getMinutes();
  
    if (endHour === 0 && endMinute === 0) {
      endHour = 24;
      endMinute = 0;
    }
  
    const top = (startHour + startMinute / 60) * 60;
    let height = ((endHour - startHour) + (endMinute - startMinute) / 60) * 60;
  
    const minHeight = 40;
    if (height < minHeight && event.calendar !== 'Task') {
      height = minHeight;
    }
  
    // Get positioning from eventPositions
    const position = eventPositions.get(event.id) || {
      left: '0%',
      width: '100%',
      zIndex: 10
    };
  
    return {
      top: `${top}px`,
      height: `${height}px`,
      left: position.left,
      width: position.width,
      zIndex: position.zIndex
    };
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hours + minutes / 60) * 60;
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    onEventClick(event, e);
  };

  const handleDateDoubleClick = (date, isAllDay, e) => {
    e.preventDefault();
    onDateDoubleClick(date, isAllDay);
  };

  // Fix for the getEventColor TypeError
  const getEventStyleClass = (event) => {
    const { eventColor } = getEventColor(event);
    const color = eventColor.replace('bg-', '');
    return {
      regularClass: `bg-${color} bg-opacity-20 border-${color} text-${color}`,
      darkClass: `text-${color}-300`,
      lightClass: `text-${color}-700`,
      color
    };
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
    if (event.isHoliday) {
      return (
        <div
          key={event.id}
          className={`
            flex justify-between items-center
            text-xs mb-1 truncate
            rounded-full py-1 px-2
            ${itemColors?.holidays || 'bg-yellow-500'}
            text-white opacity-75
            cursor-pointer hover:opacity-100 transition-opacity
            mr-5
          `}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick({
              ...event,
              description: `${event.type} Holiday in United States`,
              date: event.date,
              time: '-',
              isReadOnly: true
            }, e);
          }}
        >
          <div className="flex items-center justify-between w-full">
            <span className="truncate">{event.title}</span>
            <span className="ml-2 opacity-75">{event.type}</span>
          </div>
        </div>
      );
    }

    const styles = getEventStyleClass(event);
    const isTask = event.calendar === 'Task';
    const isCompleted = event.completed;

    if (isTask) {
      return (
        <div
          key={event.id}
          {...getDragHandleProps(event)}
          className={`
            flex justify-between items-center
            text-xs mb-1 truncate cursor-pointer
            rounded-full py-1 px-2
            ${isCompleted ? 'opacity-50' : ''}
            bg-${styles.color} text-white
            hover:bg-opacity-80 transition-colors duration-200 z-40
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
                text-white`} 
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
        {...getDragHandleProps(event)}
        className={`
          flex justify-between items-center
          text-xs mb-1 truncate cursor-pointer
          rounded-full py-1 px-2
          bg-${styles.color} text-white
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
      if (a.isHoliday && !b.isHoliday) return -1;
      if (!a.isHoliday && b.isHoliday) return 1;
      if (a.calendar === 'Task' && b.calendar === 'Task') {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
      }
      return 0;
    });

    return (
      <div className={`
        transition-all duration-300 ease-in-out origin-top
        ${isAllDayExpanded ? 'max-h-none' : ''}
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

  const renderTimeSlotEvent = (event) => {
    if (event.calendar === 'Task') {
      const styles = getEventStyleClass(event);
      const startTime = new Date(event.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      return (
        <div
          key={event.id}
          {...getDragHandleProps(event)}
          className={`
            absolute text-xs overflow-hidden cursor-pointer
            rounded py-1 px-2
            ${event.completed ? 'opacity-50' : ''}
            border ${styles.regularClass}
            hover:bg-opacity-30 transition-colors duration-200
            ${event.completed ? 'line-through' : ''}
          `}
          style={getEventStyle(event)}
          onClick={(e) => handleEventClick(event, e)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center overflow-hidden">
              <Check 
                className={`w-4 h-4 mr-1 flex-shrink-0
                  ${event.completed ? 'opacity-50' : ''} 
                  ${darkMode 
                    ? `text-${styles.color}-400` 
                    : `text-${styles.color}-500`
                  }`} 
              />
              <span className="truncate">{event.title}</span>
            </div>
            <span className={`ml-1 text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${event.completed ? 'opacity-50' : ''}`}>
              {startTime}
            </span>
          </div>
        </div>
      );
    }

    if (event.isHoliday) {
      const styles = getEventStyleClass(event);
      return (
        <div
          key={event.id}
          className={`
            absolute text-xs overflow-hidden cursor-pointer
            rounded py-1 px-2
            border ${styles.regularClass}
            opacity-75 hover:opacity-100 transition-opacity
          `}
          style={getEventStyle(event)}
          onClick={(e) => handleEventClick({
            ...event,
            description: `${event.type} Holiday in United States`,
            time: '-',
            isReadOnly: true
          }, e)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="truncate">{event.title}</div>
            <span className="ml-2 opacity-75">{event.type}</span>
          </div>
        </div>
      );
    }

    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const isCrossingMidnight = isEventCrossingMidnight(event);
    const isNextDay = start.getDate() !== currentDate.getDate();
    const styles = getEventStyleClass(event);

    return (
      <div
        key={event.id}
        {...getDragHandleProps(event)}
        className={`absolute ${styles.regularClass} text-xs overflow-hidden rounded cursor-pointer hover:bg-opacity-30 transition-colors duration-200 border
         ${darkMode ? styles.darkClass : styles.lightClass}`}
        style={getEventStyle(event, isNextDay)}
        onClick={(e) => handleEventClick(event, e)}
      >
        <div className="w-full h-full p-1.5 flex flex-col pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="font-bold truncate">{event.title}</div>
            {isNextDay ? (
              <span className={`text-[10px] ml-1 px-1 rounded
                ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
              `}>
                Cont'd
              </span>
            ) : isCrossingMidnight ? (
              <span className={`text-[10px] ml-1 px-1 rounded
                ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
              `}>
                Next day
              </span>
            ) : null}
          </div>
          <div className="text-xs">
            {isNextDay ? (
              // Next day portion
              `12:00 AM - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            ) : isEventCrossingMidnight ? (
              // First day portion
              `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 12:00 AM`
            ) : (
              // Regular event
              `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${
                end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDropPreview = () => {
    if (!dropPreview) return null;
    
    const styles = getEventStyleClass(dropPreview);
    return (
      <div
        className={`absolute pointer-events-none opacity-50 
          ${styles.regularClass}
          text-xs overflow-hidden rounded
          ${darkMode ? styles.darkClass : styles.lightClass}
        `}
        style={getEventStyle({
          ...dropPreview,
          start_time: dropPreview.start_time,
          end_time: dropPreview.end_time
        })}
      >
        <div className="w-full h-full p-1.5 flex flex-col">
          <div className="font-bold truncate">{dropPreview.title}</div>
          <div className="text-xs">
            {new Date(dropPreview.start_time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    );
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
      <div className={`flex-1 overflow-y-auto time-grid-container ${darkMode ? 'dark-scrollbar' : ''} relative`}>
        <div className="flex" style={{ height: '1440px' }}>
          {/* Time column */}
          <div className="w-16 flex-shrink-0 relative">
            {hours.map((hour) => (
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
          
          {/* Separator line */}
          <div className={`w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} style={{ height: '1440px' }}></div>

          {/* Events area */}
          <div 
            className="flex-grow relative" 
            style={{ height: '1440px' }}
            {...getDropTargetProps(currentDate)}
          >
            {hours.map((hour, index) => (
              <div 
                key={hour} 
                className={`absolute w-full ${index < hours.length - 1 ? `border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}` : ''}`} 
                style={{ top: `${hour * 60}px`, height: '60px' }}
                onDoubleClick={(e) => handleTimeSlotDoubleClick(e, currentDate, hour, onDateDoubleClick)}
              ></div>
            ))}

            {/* Render timed events */}
            {timedEvents.map(event => renderTimeSlotEvent(event))}

            {/* Drop Preview */}
            {renderDropPreview()}

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
