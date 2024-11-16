'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import DayEventPopover from '@/components/Modals/DayEventPopover';
import { Check } from 'lucide-react';
import { useCalendarDragDrop } from '@/hooks/useCalendarDragDrop';
import holidayService from '@/utils/holidayUtils';  


const MonthView = ({ currentDate, selectedDate, events, onDateClick, onDateDoubleClick, onEventClick, shiftDirection, onViewChange, onEventUpdate, itemColors, serverUsers }) => {
  const { darkMode } = useTheme();
  const [openPopover, setOpenPopover] = useState(null);
  const containerRef = useRef(null);
  const [cellHeight, setCellHeight] = useState(0);
  const [eventsPerDay, setEventsPerDay] = useState(2);
  const [holidays, setHolidays] = useState([]); 

  // Add holiday fetching effect
  useEffect(() => {
    const monthHolidays = holidayService.getMonthHolidays(currentDate);
    setHolidays(monthHolidays);
  }, [currentDate]);

  const { getDragHandleProps, getDropTargetProps, dropPreview } = useCalendarDragDrop({
    onEventUpdate,
    darkMode,
    view: 'month',
    shouldAllowDrag: (event) => !event.isHoliday 
  });

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

  // Helper functions for date calculations
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
  
    // Use optional chaining and provide fallback color
    
    //choosing eventColor will be based of users first (if there are). else (if no user, must be on default calendar) 
    //decide base of the calendar type
    const otherColor = [];
    let eventColor; 
    let tempColor;

    if (!(serverUsers.length === 0)){
      eventColor = itemColors?.[`user${event.user_id}`]
    }

    tempColor = itemColors?.[calendarType] 
    ? itemColors[calendarType]
    : (() => {
        switch (calendarType) {
          case 'Task':
            return itemColors?.tasks || 'bg-red-500';  
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

    otherColor.push(tempColor)


    eventColor = otherColor.shift()
   

    const bgGradientOther = otherColor.length > 0
      ? `bg-gradient-to-b from-${otherColor[0]}/25 ${otherColor.slice(1, otherColor.length-1).map(color => `via-${color}/25`).join(' ')} to-${otherColor[otherColor.length - 1]}/25`
      : `bg-gradient-to-b from-${eventColor.replace('bg-', '')}/25 to-${eventColor.replace('bg-', '')}/25`;
    console.log(bgGradientOther,'dog')


    const isAllDay = isAllDayEvent(event);
    const isTask = event.calendar === 'Task';
    const isCompleted = event.completed;
    const eventTime = isAllDay ? 'All day' : new Date(event.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
    // Augment event with calculated styles and custom drag start handler
    const augmentedEvent = {
      ...event,
      eventColor,
      isAllDay,
      isTask,
      isCompleted,
      eventTime,
      onDragStart: (e) => {
        // Create a custom drag image
        const dragElement = e.target.cloneNode(true);
        dragElement.style.position = 'absolute';
        dragElement.style.top = '-1000px';
        dragElement.style.opacity = '0';
        document.body.appendChild(dragElement);
        
        e.dataTransfer.setDragImage(dragElement, 0, 0);
        e.currentTarget.style.opacity = '0.4';
        
        // Clean up the temporary element
        requestAnimationFrame(() => {
          document.body.removeChild(dragElement);
        });
      }
    };
  
    return (
      <div
        key={event.id}
        {...getDragHandleProps(augmentedEvent)}
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
          ${bgGradientOther}
        `}
      onClick={(e) => {
          e.stopPropagation();
          onEventClick(event, e);
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

      // Combine holidays with regular events and sort
      const dayEvents = [...events, ...holidays]
        .filter(event => isSameDay(new Date(event.start_time), date))
        .sort((a, b) => {
          // Show holidays first
          if (a.isHoliday && !b.isHoliday) return -1;
          if (!a.isHoliday && b.isHoliday) return 1;
          // Then sort tasks
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
          {...getDropTargetProps(date, i)}
          className={`border-r border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${
            isCurrentMonth ? darkMode ? 'bg-gray-800' : 'bg-white' : darkMode ? 'bg-gray-900' : 'bg-gray-100'
          } ${isWeekendDay ? darkMode ? 'bg-opacity-90' : 'bg-opacity-95' : ''} p-1 relative overflow-hidden`}
          style={{ height: `${cellHeight}px` }}
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
            
            {/* Drop Preview */}
            {dropPreview && isSameDay(date, new Date(dropPreview.date)) && (
              <div 
                className={`
                  flex justify-between items-center
                  text-xs mb-1 truncate pointer-events-none
                  rounded-full py-1 px-2
                  ${dropPreview.isCompleted ? 'opacity-50' : ''}
                  ${dropPreview.isAllDay 
                    ? `${dropPreview.eventColor} text-white` 
                    : `border border-${dropPreview.eventColor.replace('bg-', '')} bg-opacity-20 text-${dropPreview.eventColor.replace('bg-', '')}`
                  }
                  ${darkMode && !dropPreview.isAllDay 
                    ? `border-${dropPreview.eventColor.replace('bg-', '')}-400 text-${dropPreview.eventColor.replace('bg-', '')}-300` 
                    : ''}
                  ${dropPreview.isTask && dropPreview.isCompleted ? 'line-through' : ''}
                  opacity-70
                `}
              >
                <div className="flex items-center overflow-hidden">
                  {dropPreview.isTask ? (
                    <Check 
                      className={`w-3 h-3 mr-1 flex-shrink-0
                        ${dropPreview.isCompleted ? 'opacity-50' : ''} 
                        ${dropPreview.isAllDay 
                          ? 'text-white' 
                          : darkMode 
                            ? `text-${dropPreview.eventColor.replace('bg-', '')}-400` 
                            : `text-${dropPreview.eventColor.replace('bg-', '')}-500`
                        }`} 
                    />
                  ) : (
                    !dropPreview.isAllDay && 
                    <span className={`inline-block w-2 h-2 rounded-full bg-${dropPreview.eventColor.replace('bg-', '')}-500 mr-1 flex-shrink-0`} />
                  )}
                  <span className={`truncate ${dropPreview.isTask && dropPreview.isCompleted ? 'line-through' : ''}`}>
                    {dropPreview.title}
                  </span>
                </div>
                <span className={`ml-1 text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${dropPreview.isCompleted ? 'opacity-50' : ''}`}>
                  {dropPreview.eventTime}
                </span>
              </div>
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
              itemColors={itemColors}
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
