import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getWeekDays, isToday, formatHour } from '../../utils/dateUtils';

const WeekView = ({ currentDate, events, onDateDoubleClick }) => {
  const { darkMode } = useTheme();
  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventStyle = (event) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMinute = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinute = parseInt(event.endTime.split(':')[1]);

    const top = (startHour + startMinute / 60) * 60; // 60px per hour
    const height = ((endHour - startHour) + (endMinute - startMinute) / 60) * 60;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const formatWeekHeader = () => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    const firstMonth = firstDay.toLocaleString('default', { month: 'short' });
    const lastMonth = lastDay.toLocaleString('default', { month: 'short' });
    const year = lastDay.getFullYear();

    if (firstMonth === lastMonth) {
      return `${firstMonth} ${year}`;
    } else {
      return `${firstMonth} - ${lastMonth} ${year}`;
    }
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

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
      <style>{scrollbarStyles}</style>
      {/* Week header */}
      <div className="text-center py-2 border-b border-gray-700">
        <h2 className="text-lg font-semibold">{formatWeekHeader()}</h2>
      </div>
      
      {/* Header row with days */}
      <div className="flex border-b border-gray-700">
        <div className="w-16 flex-shrink-0"></div>
        {weekDays.map((day, index) => (
          <div key={index} className="flex-1 text-center py-2">
            <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</div>
            <div className={`flex items-center justify-center w-8 h-8 mx-auto ${
              isToday(day) ? 'bg-blue-500 text-white rounded-full' : ''
            }`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className={`flex-1 overflow-y-auto ${darkMode ? 'dark-scrollbar' : ''}`}>
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-gray-700 min-h-[60px]">
            <div className="w-16 flex-shrink-0 text-right pr-2 pt-1 text-xs">
              {formatHour(hour)}
            </div>
            {weekDays.map((day, dayIndex) => (
              <div
                key={`${hour}-${dayIndex}`}
                className="flex-1 border-l border-gray-700 relative"
                onDoubleClick={() => {
                  const clickedDate = new Date(day);
                  clickedDate.setHours(hour);
                  onDateDoubleClick(clickedDate);
                }}
              >
                {events
                  .filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate.getDate() === day.getDate() &&
                           eventDate.getMonth() === day.getMonth() &&
                           eventDate.getFullYear() === day.getFullYear() &&
                           parseInt(event.startTime.split(':')[0]) === hour;
                  })
                  .map(event => (
                    <div
                      key={event.id}
                      className="absolute left-0 right-0 bg-blue-500 text-white text-xs p-1 overflow-hidden rounded"
                      style={getEventStyle(event)}
                    >
                      {event.title}
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;