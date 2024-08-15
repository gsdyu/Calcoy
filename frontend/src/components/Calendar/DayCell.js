import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { isToday } from '../../utils/dateUtils';

const DayCell = ({ day, currentDate }) => {
  const { darkMode } = useTheme();
  const isCurrentDay = day && isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} p-2 flex flex-col`}>
      {day && (
        <span className={`${isCurrentDay ? 'bg-blue-500 text-white rounded-full px-2 py-1 self-start' : ''}`}>
          {day}
        </span>
      )}
    </div>
  );
};

export default DayCell;