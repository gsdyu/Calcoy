import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getWeekDays, isToday } from '../../utils/dateUtils';

const WeekView = ({ currentDate, events, onDateDoubleClick }) => {
  const { darkMode } = useTheme();
  const weekDays = getWeekDays(currentDate);

  const handleDoubleClick = (date, hour) => {
    const newDate = new Date(date);
    newDate.setHours(hour);
    onDateDoubleClick(newDate);
  };

  return (
    <div className={`h-full grid grid-cols-8 gap-px ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-2`}>Time</div>
      {weekDays.map((day, index) => (
        <div key={index} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 text-center`}>
          <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</div>
          <div className={`${isToday(day) ? 'bg-blue-500 text-white' : ''} rounded-full px-2 py-1 inline-block`}>
            {day.getDate()}
          </div>
        </div>
      ))}
      {[...Array(24)].map((_, hour) => (
        <React.Fragment key={hour}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
          </div>
          {weekDays.map((day, dayIndex) => (
            <div 
              key={`${hour}-${dayIndex}`} 
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              onDoubleClick={() => handleDoubleClick(day, hour)}
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
                  <div key={event.id} className="bg-blue-500 text-white p-1 rounded text-sm mb-1">
                    {event.title}
                  </div>
                ))
              }
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default WeekView;