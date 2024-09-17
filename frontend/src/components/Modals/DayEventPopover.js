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
        <div className="max-h-48 overflow-y-auto p-1">
          {events.map((event, index) => (
            <div 
              key={index} 
              className={`mb-1 py-1 px-2 rounded-full text-xs ${
                darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
              } cursor-pointer hover:opacity-80`}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium truncate mr-1">{event.title || '(No title)'}</span>
                <span className="whitespace-nowrap text-[10px]">
                  {format(new Date(event.start_time), 'h:mm a')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DayEventPopover;