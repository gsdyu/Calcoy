'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getWeekDays, isToday, formatHour } from '@/utils/dateUtils';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useCalendarDragDrop } from '@/hooks/useCalendarDragDrop';
import { handleTimeSlotDoubleClick } from '@/utils/timeSlotUtils';
import { calculateEventColumns } from '@/utils/calendarPositioningUtils';
import holidayService from '@/utils/holidayUtils';


const WeekView = ({ currentDate, selectedDate, events, onDateClick, onDateDoubleClick, onEventClick, shiftDirection, onEventUpdate, itemColors, activeCalendar, getEventColor, visibleItems, getVisibility }) => {
  const { darkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAllDayExpanded, setIsAllDayExpanded] = useState(false);
  const [eventPositions, setEventPositions] = useState(new Map());
  const [holidays, setHolidays] = useState([]); 

  // Initialize the enhanced drag and drop hook
  const { 
    draggedEvent,
    dragOverColumn,
    dropPreview,
    getDragHandleProps,
    getDropTargetProps,
  } = useCalendarDragDrop({ 
    onEventUpdate, 
    darkMode,
    view: 'week',
    cellHeight: 60,
    shouldAllowDrag: (event) => !event.isHoliday
  });

  // Add holiday fetching effect
  useEffect(() => {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Get holidays for both months if week spans two months
    const monthHolidays = holidayService.getMonthHolidays(weekStart);
    if (weekStart.getMonth() !== weekEnd.getMonth()) {
      const nextMonthHolidays = holidayService.getMonthHolidays(weekEnd);
      setHolidays([...monthHolidays, ...nextMonthHolidays]);
    } else {
      setHolidays(monthHolidays);
    }
  }, [currentDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const positions = calculateEventColumns([...events, ...holidays].filter(event => !isAllDayEvent(event)));
    setEventPositions(positions);
  }, [events, holidays]);
  
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


const getEventStyle = (event, isNextDayPortion = false) => {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  let startHour = isNextDayPortion ? 0 : startDate.getHours();
  let startMinute = isNextDayPortion ? 0 : startDate.getMinutes();
  let endHour = endDate.getHours();
  let endMinute = endDate.getMinutes();

  // Handle next day portion of events
  if (!isNextDayPortion && isEventCrossingMidnight(event)) {
    endHour = 24;
    endMinute = 0;
  } else if (endHour === 0 && endMinute === 0) {
    endHour = 24;
    endMinute = 0;
  }

  const top = (startHour + startMinute / 60) * 60;
  let height = ((endHour - startHour) + (endMinute - startMinute) / 60) * 60;

  const minHeight = 22;
  if (height < minHeight && event.calendar !== 'Task') {
    height = minHeight;
  }

  const position = eventPositions.get(event.id) || {
    left: '0%',
    zIndex: 10,
    opacity: 0.7  
  };

  return {
    top: `${top}px`,
    height: `${height}px`,
    left: position.left,
    right: '20px',
    zIndex: position.zIndex,
    opacity: position.opacity 
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

  const shouldShowEventOnDay = (event, day) => {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
  
    // Special case for exact midnight end time
    if (eventEnd.getHours() === 0 && eventEnd.getMinutes() === 0) {
      // Don't show on the end day if it ends exactly at midnight
      return eventStart.getTime() <= dayEnd.getTime() && eventEnd.getTime() > dayStart.getTime();
    }
  
    return eventStart.getTime() <= dayEnd.getTime() && eventEnd.getTime() > dayStart.getTime();
  };

  const isEventCrossingMidnight = (event) => {
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    
    // Create next day at midnight in the same timezone
    const nextDay = new Date(startDate);
    nextDay.setDate(startDate.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    
    return endDate.getTime() > nextDay.getTime();
  };

  const formatEventTime = (event, isNextDay) => {
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
  
    if (isEventCrossingMidnight(event)) {
      if (isNextDay) {
        // Next day portion - show just end time
        return endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      } else {
        // First day portion - show just start time
        return startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      }
    }
  
    // For events ending exactly at midnight
    if (endDate.getHours() === 0 && endDate.getMinutes() === 0) {
      return `${startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - 12:00 AM`;
    }
  
    // Regular events
    return `${startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${
      endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    }`;
  };
  const handleDateClick = (day) => {
    onDateClick(new Date(day));
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    onEventClick(event, e);
  };

  const toggleAllDayExpansion = () => {
    setIsAllDayExpanded(prev => !prev);
  };

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

    const calendarType = event.calendar || 'default';
    let {eventColor, otherColorList} = getEventColor(event, calendarType, activeCalendar);
    if (eventColor == null) return;
    const bgGradientOther = otherColorList.length > 0 
      ? `bg-gradient-to-b from-${otherColorList[0]}/25 ${otherColorList.slice(1, otherColorList.length-1).map(color => `via-${color}/25`).join(' ')} to-${otherColorList[otherColorList.length - 1]}/25`
      : `bg-gradient-to-b from-${eventColor.replace('bg-', '')}/25 to-${eventColor.replace('bg-', '')}/25`;
    eventColor = eventColor.replace('bg-','');
    const isTask = event.calendar === 'Task';
    const isCompleted = event.completed;
    const augmentedEvent = {
      ...event,
      eventColor,
      bgGradientOther,
      isAllDay: true
    };

    if (isTask) {
      return (
        <div
          key={event.id}
          {...getDragHandleProps(augmentedEvent)}
          className={`
            flex justify-between items-center
            text-xs mb-1 truncate cursor-pointer
            rounded-full py-1 px-2
            ${isCompleted ? 'opacity-50' : ''}
            ${bgGradientOther} text-${eventColor}
            hover:bg-opacity-80 transition-colors duration-200 z-40
            mr-5
            ${isCompleted ? 'line-through' : ''}
          `}
          onClick={(e) => {
            e.stopPropagation();
            handleEventClick(event, e);
          }}
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
        {...getDragHandleProps(augmentedEvent)}
        className={`
          flex justify-between items-center
          text-xs mb-1 truncate cursor-pointer
          rounded-full py-1 px-2
          bg-${eventColor} text-white
          hover:bg-opacity-80 transition-colors duration-200 z-40
          mr-5
        `}
        onClick={(e) => {
          e.stopPropagation();
          handleEventClick(event, e);
        }}
        style={{ position: 'relative', zIndex: 40 }}
      >
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  const renderAllDayEvents = (dayEvents) => {
    const maxVisibleEvents = 3;
    const sortedEvents = [...dayEvents].sort((a, b) => {
      if (a.isHoliday && !b.isHoliday) return -1;
      if (!a.isHoliday && b.isHoliday) return 1;
      if (a.calendar === 'Task' && b.calendar === 'Task') {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
      }
      return 0;
    });
    
    const visibleCount = isAllDayExpanded 
      ? sortedEvents.length 
      : (sortedEvents.length <= maxVisibleEvents ? sortedEvents.length : 2);
    const hiddenCount = sortedEvents.length - visibleCount;
  
    return (
      <div className={`
        transition-all duration-300 ease-in-out origin-top
        ${isAllDayExpanded ? 'max-h-none' : ''}
      `}>
        <div className="space-y-1">
          {sortedEvents.slice(0, visibleCount).map(event => renderAllDayEvent(event))}
          {!isAllDayExpanded && sortedEvents.length > maxVisibleEvents && (
            <div 
              className="text-xs cursor-pointer text-blue-500 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                setIsAllDayExpanded(true);
              }}
              style={{ position: 'relative', zIndex: 50 }}
            >
              +{hiddenCount} more
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasMoreThanThreeAllDayEvents = weekDays.some(day => {
    const allDayEvents = [...events, ...holidays].filter(event => 
      isAllDayEvent(event) && isSameDay(new Date(event.start_time), day)
    );
    return allDayEvents.length > 3;
  });
  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
      <style>{scrollbarStyles}</style>
      
      {/* Header row with days */}
      <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} min-h-[40px]`}>
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
        <div className="w-16 flex-shrink-0 text-xs pr-2 flex flex-col items-end justify-between py-1">
          <span>All-day</span>
          {hasMoreThanThreeAllDayEvents && (
            <button 
              className="text-blue-500 hover:text-blue-600 focus:outline-none"
              onClick={toggleAllDayExpansion}
            >
              <ChevronDown 
                size={16} 
                className={`transform transition-transform duration-300 ${
                  isAllDayExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
        {weekDays.map((day, dayIndex) => {
          const isWeekendDay = isWeekend(day);
          const isSelected = isSameDay(day, selectedDate);
          const allDayEvents = [...events, ...holidays].filter(event => 
            isAllDayEvent(event) && isSameDay(new Date(event.start_time), day)
          );
          
          return (
            <div
              key={`all-day-${dayIndex}`}
              {...getDropTargetProps(day, dayIndex)}
              className={`flex-1 border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'} relative p-1 overflow-hidden
                ${isWeekendDay ? darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-100 bg-opacity-50' : ''}
                ${dragOverColumn === dayIndex ? darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100 bg-opacity-30' : ''}
              `}
              onClick={() => handleDateClick(day)}
              onDoubleClick={() => {
                const clickedDate = new Date(day);
                clickedDate.setHours(0, 0, 0, 0);
                onDateDoubleClick(clickedDate, true);
              }}
            >
              {isSelected && (
                <div className={`absolute inset-0 ${darkMode ? 'bg-blue-500 opacity-20' : 'bg-blue-50'} z-0 pointer-events-none`}></div>
              )}
              {renderAllDayEvents(allDayEvents)}
              {/* Drop Preview for All-day events */}
              {dropPreview && dropPreview.isAllDay && dropPreview.columnIndex === dayIndex && (
                <div className="opacity-50">
                  {renderAllDayEvent(dropPreview)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      <div className={`flex-1 overflow-y-auto time-grid-container ${darkMode ? 'dark-scrollbar' : ''} relative`}>
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
                    {...getDropTargetProps(day, dayIndex, hour)} 
                    className={`absolute top-0 bottom-0 border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'} 
                      ${isWeekendDay ? darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-100 bg-opacity-50' : ''}
                      ${dragOverColumn === dayIndex ? darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100 bg-opacity-30' : ''}
                    `}
                    style={{ left: `${(100 / 7) * dayIndex}%`, width: `${100 / 7}%` }}
                    onClick={() => handleDateClick(day)}
                    onDoubleClick={(e) => handleTimeSlotDoubleClick(e, day, hour, onDateDoubleClick)}
                  >
                    {isSelected && (
                      <div className={`absolute inset-0 ${darkMode ? 'bg-blue-500 opacity-20' : 'bg-blue-50'} z-0 pointer-events-none`}></div>
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
              className="absolute left-16 right-0 z-40"
              style={{ top: `${getCurrentTimePosition()}px` }}
            >
              <div className="relative w-full">
                <div 
                  className="absolute border-t border-red-500" 
                  style={{ left: `${(100 / 7) * dayIndex}%`, width: `${100 / 7}%` }}
                >
                  <div className="absolute left-0 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1.5 -translate-y-1.5"></div>
                </div>
              </div>
            </div>
          )
        ))}

        {/* Render events */}
        <div className="absolute top-0 left-16 right-0 bottom-0 pointer-events-none">
          {weekDays.map((day, dayIndex) => (
            <div key={`events-${dayIndex}`} className="absolute top-0 bottom-0" 
                 style={{ left: `${(100 / 7) * dayIndex}%`, width: `${100 / 7}%` }}>
              {[...events, ...holidays]
                .filter(event => !isAllDayEvent(event) && shouldShowEventOnDay(event, day))
                .sort((a, b) => {
                  // Show holidays first
                  if (a.isHoliday && !b.isHoliday) return -1;
                  if (!a.isHoliday && b.isHoliday) return 1;
                  // Then sort tasks
                  if (a.calendar === 'Task' && b.calendar === 'Task') {
                    if (a.completed !== b.completed) return a.completed ? 1 : -1;
                  }
                  return 0;
                })
                .map(event => {
                  const eventStart = new Date(event.start_time);
                  const eventEnd = new Date(event.end_time);
                  
                  const currentDate = new Date(day);
                  currentDate.setHours(0, 0, 0, 0);
                  const eventStartDate = new Date(eventStart);
                  eventStartDate.setHours(0, 0, 0, 0);
                  
                  const isNextDay = currentDate.getTime() > eventStartDate.getTime();
                  const isCrossingMidnight = isEventCrossingMidnight(event);
                  
                  const calendarType = event.calendar || 'default';
                  let {eventColor, otherColorList} = getEventColor(event, calendarType, activeCalendar);
                  if (eventColor == null) return;
                  const bgGradientOther = otherColorList.length > 0 
                    ? `bg-gradient-to-b from-${otherColorList[0]}/25 ${otherColorList.slice(1, otherColorList.length-1).map(color => `via-${color}/25`).join(' ')} to-${otherColorList[otherColorList.length - 1]}/25`
                    : `bg-gradient-to-b from-${eventColor.replace('bg-', '')}/25 to-${eventColor.replace('bg-', '')}/25`;
                  eventColor = eventColor.replace('bg-', '');

                  const augmentedEvent = {
                    ...event,
                    eventColor,
                    isAllDay: false,
                    isNextDay,
                    bgGradientOther,
                    isCrossingMidnight
                  };

                  if (event.calendar === 'Task') {
                    eventColor = eventColor.replace('bg-','')
                    const startTime = new Date(event.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    return (
                      <div
                        key={event.id}
                        {...getDragHandleProps(augmentedEvent)}
                        className={`
                          absolute text-xs overflow-hidden cursor-pointer pointer-events-auto
                          rounded
                          ${event.completed ? 'opacity-50' : ''}
                          border border-${eventColor} ${bgGradientOther} bg-opacity-20 text-${eventColor}
                          ${darkMode ? `border-${eventColor}-400 text-${eventColor}-300` : ''}
                          hover:bg-opacity-30 transition-colors duration-200
                          ${event.completed ? 'line-through' : ''}
                        `}
                        style={getEventStyle(event)}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="flex items-center justify-between w-full p-1.5">
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
                          <span className={`ml-1 text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${event.completed ? 'opacity-50' : ''}`}>
                            {startTime}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Calculate duration considering midnight crossing
                  const start = new Date(event.start_time);
                  const end = new Date(event.end_time);
                  
                  let endHours = end.getHours();
                  if (endHours === 0 && end.getMinutes() === 0) {
                    endHours = 24;
                  }
                  
                  const durationMinutes = isNextDay ? 
                    ((end.getHours() + 24 * (end.getDate() - start.getDate()) - start.getHours()) * 60) +
                    (end.getMinutes() - start.getMinutes()) :
                    ((endHours - start.getHours()) * 60) + 
                    (end.getMinutes() - start.getMinutes());
                     
                  return (
                    <div
                      key={`${event.id}${isNextDay ? '-next' : ''}`}
                      {...(event.isHoliday ? {} : getDragHandleProps(augmentedEvent))}
                        className={`absolute text-xs overflow-hidden rounded cursor-pointer 
                        hover:brightness-95 transition-all duration-200 border border-${eventColor} pointer-events-auto
                        ${eventPositions.get(event.id)?.zIndex > 20 ? `bg-${eventColor}` : bgGradientOther}
                        ${darkMode ? `text-${eventColor.replace('-500','')}-300` : `text-${eventColor.replace('-500','')}-700`}
                        ${event.isHoliday ? 'opacity-75 hover:opacity-100' : ''}`}
                      style={{
                        ...getEventStyle(event, isNextDay),
                        // Optional: Add hover opacity behavior
                        '&:hover': {
                          opacity: 1
                        }
                      }}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      <div className="w-full h-full pointer-events-auto min-h-[22px]">
                        {durationMinutes < 30 ? (
                          <div className="w-full h-full flex items-center justify-between px-1.5">
                            <div className="truncate flex-grow text-[11px]">
                              {event.title}
                              {event.isHoliday && <span className="ml-2 opacity-75">({event.type})</span>}
                            </div>
                            <div className="text-[11px] ml-1 whitespace-nowrap flex-shrink-0">
                              {formatEventTime(event, isNextDay)}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full p-1.5 flex flex-col">
                            <div className="font-bold truncate text-sm">
                              {event.title}
                              {event.isHoliday && <span className="ml-2 opacity-75">({event.type})</span>}
                            </div>
                            <div className="text-xs whitespace-nowrap">
                              {formatEventTime(event, isNextDay)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              }
            
            {/* Drop Preview for Regular Events */}
            {dropPreview && !dropPreview.isAllDay && dropPreview.columnIndex === dayIndex && (
              <div
                className={`absolute 
                  ${(() => {
                    const calendarType = dropPreview.calendar || 'default';
                    let {eventColor, otherColorList} = getEventColor(dropPreview, calendarType, activeCalendar)
                    if (eventColor == null) return eventColor
                    eventColor = eventColor.replace('bg-', '');
                    const bgGradientOther = otherColorList.length > 0 
                      ? `bg-gradient-to-b from-${otherColorList[0]}/25 ${otherColorList.slice(1, otherColorList.length-1).map(color => `via-${color}/25`).join(' ')} to-${otherColorList[otherColorList.length - 1]}/25`
                      : `bg-gradient-to-b from-${eventColor.replace('bg-', '')}/25 to-${eventColor.replace('bg-', '')}/25`;
                    return `
                      ${dropPreview.bgGradientOther} bg-opacity-20 
                      text-xs overflow-hidden rounded cursor-pointer
                      border border-${eventColor} pointer-events-none opacity-50
                      ${darkMode ? `text-${eventColor}-300` : `text-${eventColor}-700`}
                    `;
                  })()}
                `}
                style={getEventStyle({
                  ...dropPreview,
                  start_time: dropPreview.start_time,
                  end_time: dropPreview.end_time
                })}
              >
                <div className="w-full h-full p-1.5 flex flex-col">
                  <div className="font-bold truncate text-sm">{dropPreview.title}</div>
                  <div className="text-xs whitespace-nowrap">
                    {formatEventTime(dropPreview, dropPreview.isNextDay)}
                  </div>
                </div>
              </div>
            )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
