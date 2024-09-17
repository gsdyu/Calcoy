import React from 'react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';

const DayEventPopover = ({ date, events, isOpen, onOpenChange }) => {
  const { darkMode } = useTheme();

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div className="w-full h-full absolute top-0 left-0 cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className={`w-48 p-0 ${
        darkMode 
          ? 'bg-gray-800 text-white' 
          : 'bg-white text-black'
      } rounded-[25px] overflow-hidden`}>
        <div className={`flex justify-between items-center p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div className="text-left">
            <div className="text-sm font-semibold">{format(date, 'EEE')}</div>
            <div className="text-xl font-bold">{format(date, 'd')}</div>
          </div>
          <button 
            onClick={() => onOpenChange(false)} 
            className={`hover:bg-opacity-20 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-300'} p-1 rounded`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto p-1">
          {events.map((event, index) => (
            <div 
              key={index} 
              className={`mb-1 p-1 rounded-md text-xs ${
                darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium truncate mr-1">{event.title || '(No title)'}</span>
                <span className="whitespace-nowrap">
                  {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
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