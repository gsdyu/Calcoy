import React from 'react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';

const DayEventPopover = ({ date, events, isOpen, onOpenChange, onEventClick, onViewChange, onDateSelect }) => {
  const { darkMode } = useTheme();

  const handleDateClick = () => {
    onDateSelect(date);
    onViewChange('Day');
    onOpenChange(false);
  };

  const onDragStart = (e, eventId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ eventId }));
  };

  const renderEventCompact = (event) => {
    const eventColor = event.color || 'blue';
    const eventTime = format(new Date(event.start_time), 'h:mm a');

    return (
      <div 
        key={event.id}
        draggable
        onDragStart={(e) => onDragStart(e, event.id)}
        className={`
          flex justify-between items-center
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
        <div className="flex items-center overflow-hidden">
          <span className={`inline-block w-2 h-2 rounded-full bg-${eventColor}-500 mr-1 flex-shrink-0`}></span>
          <span className="truncate">{event.title}</span>
        </div>
        <span className={`ml-1 text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{eventTime}</span>
      </div>
    );
  };

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
          {events.map((event) => renderEventCompact(event))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DayEventPopover;