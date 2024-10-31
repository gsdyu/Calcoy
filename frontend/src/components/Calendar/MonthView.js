'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import DayEventPopover from '@/components/Modals/DayEventPopover';
import { Check } from 'lucide-react';

const MonthView = ({ currentDate, selectedDate, events, onDateClick, onDateDoubleClick, onEventClick, shiftDirection, onViewChange, onEventUpdate, itemColors }) => {
  const { darkMode } = useTheme();
  const [openPopover, setOpenPopover] = useState(null);
  const containerRef = useRef(null);
  const [cellHeight, setCellHeight] = useState(0);
  const [eventsPerDay, setEventsPerDay] = useState(2);

  useEffect(() => {
    const calculateDimensions = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const weeksInMonth = getWeeksInMonth(currentDate);
        const calculatedCellHeight = Math.floor(containerHeight / weeksInMonth);
        // the offset is used to maximize the containerHeight without being too big to need a scroll bar
        // without offset: calculatedCellHeight is too large, and requires a scroll bar; offset removes scroll bar
        // default offset: satisfy months with 4 and 6 weeks.
        let offset = (calculatedCellHeight * .022)
        if (weeksInMonth === 5) offset = (calculatedCellHeight * .020)
        setCellHeight(calculatedCellHeight - offset);
        const eventHeight = 24; 
        const dateHeight = 24; 
        const moreIndicatorHeight = 20; 
        const padding = 8; 
        const availableHeight = calculatedCellHeight - dateHeight - padding - moreIndicatorHeight;
        const calculatedEventsPerDay = Math.floor(availableHeight / eventHeight);
        setEventsPerDay(Math.max(1, calculatedEventsPerDay - 1)); 
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, [currentDate]);

  const onDragStart = (e, eventId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ eventId }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, date) => {
    e.preventDefault();
    const { eventId } = JSON.parse(e.dataTransfer.getData('text/plain'));
    onEventUpdate(eventId, date);

    // Visual feedback
    const dropTarget = e.currentTarget;
    dropTarget.style.transition = 'background-color 0.3s';
    dropTarget.style.backgroundColor = darkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)';
    setTimeout(() => {
      dropTarget.style.backgroundColor = '';
    }, 300);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
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

  const getWeeksInMonth = (date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    return Math.ceil((daysInMonth + firstDay) / 7);
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

  const renderEventCompact = (event) => {
    const calendarType = event.calendar || 'default';
  
    // Use optional chaining and provide fallback color
    const eventColor = itemColors?.[calendarType] 
      ? itemColors[calendarType]
      : (() => {
          switch (calendarType) {
            case 'Personal':
              return itemColors?.email || 'bg-blue-500'; 
            case 'Family':
              return itemColors?.familyBirthday || 'bg-orange-500'; 
            case 'Work':
              return 'bg-purple-500'; 
            default:
              return 'bg-gray-400'; 
          }
        })();
    
    const isAllDay = isAllDayEvent(event);
    const isTask = event.calendar === 'Task';
    const isCompleted = event.completed;
    const eventTime = isAllDay ? 'All day' : new Date(event.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
    return (
      <div
        key={event.id}
        draggable
        onDragStart={(e) => onDragStart(e, event.id)}
        className={`
          flex justify-between items-center
          text-xs mb-1 truncate cursor-pointer
          rounded-full py-1 px-2
          ${isCompleted ? 'opacity-50' : ''}
          ${isAllDay 
            ? `${eventColor} text-white` 
            : `border border-${eventColor.replace('bg-', '')} bg-opacity-20 text-${eventColor.replace('bg-', '')}`
          }
          ${darkMode && !isAllDay ? `border-${eventColor.replace('bg-', '')}-400 text-${eventColor.replace('bg-', '')}-300` : ''}
          hover:bg-opacity-30 transition-colors duration-200
          ${isTask && isCompleted ? 'line-through' : ''}
        `}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
      >
        <div className="flex items-center overflow-hidden">
          {isTask ? (
            <Check 
              className={`w-3 h-3 mr-1 flex-shrink-0
                ${isCompleted ? 'opacity-50' : ''} 
                ${isAllDay 
                  ? 'text-white' 
                  : darkMode 
                    ? `text-${eventColor}-400` 
                    : `text-${eventColor}-500`
                }`} 
            />
          ) : (
            !isAllDay && <span className={`inline-block w-2 h-2 rounded-full bg-${eventColor}-500 mr-1 flex-shrink-0`} />
          )}
          <span className={`truncate ${isTask && isCompleted ? 'line-through' : ''}`}>
            {event.title}
          </span>
        </div>
        <span className={`ml-1 text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${isCompleted ? 'opacity-50' : ''}`}>
          {eventTime}
        </span>
      </div>
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInPrevMonth = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const calendarType = 'default';
  
    // Use optional chaining and provide fallback color
    const eventColor = itemColors?.[calendarType] 
      ? itemColors[calendarType]
      : (() => {
          switch (calendarType) {
            case 'Personal':
              return itemColors?.email || 'bg-blue-500'; 
            case 'Family':
              return itemColors?.familyBirthday || 'bg-orange-500'; 
            case 'Work':
              return 'bg-purple-500'; 
            default:
              return 'bg-gray-400'; 
          }
        })();
    const days = [];
    let dayCounter = 1;
    let nextMonthCounter = 1;

    for (let i = 0; i < getWeeksInMonth(currentDate) * 7; i++) {
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

      // Sort completed tasks to the end
      const dayEvents = events.filter(event => isSameDay(new Date(event.start_time), date))
        .sort((a, b) => {
          if (a.calendar === 'Task' && b.calendar === 'Task') {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
          }
          return 0;
        });

      const allDayEvents = dayEvents.filter(isAllDayEvent);
      const regularEvents = dayEvents.filter(event => !isAllDayEvent(event));
      
      const sortedEvents = [...allDayEvents, ...regularEvents];
      const displayedEvents = sortedEvents.slice(0, eventsPerDay);
      const additionalEventsCount = Math.max(0, sortedEvents.length - eventsPerDay);

      days.push(
        <div
          key={i}
          className={`border-r border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${
            isCurrentMonth ? darkMode ? 'bg-gray-800' : 'bg-white' : darkMode ? 'bg-gray-900' : 'bg-gray-100'
          } ${isWeekendDay ? darkMode ? 'bg-opacity-90' : 'bg-opacity-95' : ''} p-1 relative overflow-hidden`}
          style={{ height: `${cellHeight}px` }}
          onClick={() => isCurrentMonth && onDateClick(date)}
          onDoubleClick={() => isCurrentMonth && onDateDoubleClick(date)}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, date)}
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
          <div className="mt-1 space-y-1 overflow-hidden" style={{ maxHeight: `${cellHeight - 24 - 8}px` }}>
            {displayedEvents.map(event => renderEventCompact(event))}
            {additionalEventsCount > 0 && (
              <button
                className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium hover:underline`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPopover(date);
                }}
              >
                {`+${additionalEventsCount} more`}
              </button>
            )}
          </div>
          {openPopover && isSameDay(openPopover, date) && (
            <DayEventPopover
              date={date}
              events={sortedEvents}
              isOpen={true}
              onOpenChange={(open) => {
                if (!open) setOpenPopover(null);
              }}
              onEventClick={onEventClick}
              onViewChange={onViewChange}
              onDateSelect={onDateClick}
            />
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div ref={containerRef} className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`grid grid-cols-7 border-b border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className={`py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-400 border-r border-gray-700' : 'text-gray-600 border-r border-gray-200'}`}>
            {day}
          </div>
        ))}
      </div>
      <div className={`flex-1 grid grid-cols-7 border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {renderCalendar()}
      </div>
    </div>
  );
};

export default MonthView;
