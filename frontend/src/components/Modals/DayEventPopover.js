import React from 'react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Check } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';

const DayEventPopover = ({ date, events, isOpen, onOpenChange, onEventClick, onViewChange, onDateSelect, itemColors }) => {
  const { darkMode } = useTheme();

  const handleDateClick = () => {
    onDateSelect(date);
    onViewChange('Day');
    onOpenChange(false);
  };

  const onDragStart = (e, eventId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ eventId }));
  };

  const isAllDayEvent = (event) => {
    if (!event?.start_time || !event?.end_time) return false;
    
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
    
    // Get color based on calendar type
    const eventColor = itemColors?.[calendarType] 
      ? itemColors[calendarType]
      : (() => {
          switch (calendarType) {
            case 'Task':
              return itemColors?.tasks || 'bg-red-500';  
            case 'Personal':
              return itemColors?.email || 'bg-blue-500'; 
            case 'Family':
              return itemColors?.family || 'bg-orange-500'; 
            case 'Work':
              return 'bg-purple-500'; 
            default:
              return 'bg-gray-400'; 
          }
        })();

    const isAllDay = isAllDayEvent(event);
    const isTask = event.calendar === 'Task';
    const isCompleted = event.completed || false;
    const eventTime = isAllDay ? 'All day' : format(new Date(event.start_time), 'h:mm a');

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
            : `border ${eventColor} bg-opacity-20`
          }
          ${darkMode && !isAllDay ? 'border-opacity-40' : ''}
          hover:bg-opacity-30 transition-colors duration-200
          ${isTask && isCompleted ? 'line-through' : ''}
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
                    ? `text-${eventColor.replace('bg-', '')}-400` 
                    : `text-${eventColor.replace('bg-', '')}-500`
                }`} 
            />
          ) : (
            !isAllDay && <span className={`inline-block w-2 h-2 rounded-full ${eventColor.replace('bg-', '')} mr-1 flex-shrink-0`} />
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

  const sortedEvents = [...events].sort((a, b) => {
    const aIsAllDay = isAllDayEvent(a);
    const bIsAllDay = isAllDayEvent(b);
    if (aIsAllDay && !bIsAllDay) return -1;
    if (!aIsAllDay && bIsAllDay) return 1;
    if (a.calendar === 'Task' && b.calendar === 'Task') {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
    }
    return new Date(a.start_time) - new Date(b.start_time);
  });

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div className="w-full h-full absolute top-0 left-0 cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent 
        className={`w-48 p-0 ${
          darkMode 
            ? 'bg-gray-800 text-white' 
            : 'bg-white text-black'
        } rounded-[25px] overflow-hidden`}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          transform: 'translate(-50%, -50%)',
          marginTop: '-80px'
        }}
      >
        <div className={`relative flex justify-center items-center p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="text-center cursor-pointer group"
            onClick={handleDateClick}
          >
            <div className="text-sm font-semibold">{format(date, 'EEE')}</div>
            <div className="relative">
              <div className={`absolute inset-0 rounded-full ${darkMode ? 'group-hover:bg-gray-600' : 'group-hover:bg-gray-300'} transition-colors duration-200`}></div>
              <div className="relative z-10 text-xl font-bold w-8 h-8 flex items-center justify-center">
                {format(date, 'd')}
              </div>
            </div>
          </div>
          <button 
            onClick={() => onOpenChange(false)} 
            className={`absolute right-2 top-2 hover:bg-opacity-20 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-300'} p-1 rounded`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto p-2 space-y-1">
          {sortedEvents.map((event) => renderEventCompact(event))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DayEventPopover;