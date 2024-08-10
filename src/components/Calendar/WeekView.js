import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getWeekDays, isToday } from '../../utils/dateUtils';

const WeekView = ({ currentDate }) => {
  const { darkMode } = useTheme();
  const weekDays = getWeekDays(currentDate);

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
      {/* Add hour rows here */}
    </div>
  );
};

export default WeekView;