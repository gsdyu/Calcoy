import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const CalendarHeader = ({ currentDate, view, onDateChange, onViewChange }) => {
  const { darkMode } = useTheme();

  const goToToday = () => onDateChange(new Date(), 'none');

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'Day') newDate.setDate(newDate.getDate() - 1);
    else if (view === 'Week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate, 'left');
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'Day') newDate.setDate(newDate.getDate() + 1);
    else if (view === 'Week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate, 'right');
  };

  const formatHeaderDate = () => {
    if (view === 'Week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const startMonth = weekStart.toLocaleString('default', { month: 'short' });
      const endMonth = weekEnd.toLocaleString('default', { month: 'short' });
      const year = weekEnd.getFullYear();

      if (startMonth === endMonth) {
        return (
          <>
            <span className="font-bold">{startMonth}</span>
            <span className={`font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>{year}</span>
          </>
        );
      } else {
        return (
          <>
            <span className="font-bold">{`${startMonth} - ${endMonth}`}</span>
            <span className={`font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>{year}</span>
          </>
        );
      }
    } else {
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();
      return (
        <>
          <span className="font-bold">{month}</span>
          <span className={`font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>{year}</span>
        </>
      );
    }
  };

  return (
    <div className={`flex items-center p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} text-sm`}>
      <div className="flex-1">
        <h2 className="text-lg font-semibold">
          {formatHeaderDate()}
        </h2>
      </div>
      
      <div className="flex-1 flex justify-center">
        <div className="flex rounded-full overflow-hidden shadow-md">
          {['Day', 'Week', 'Month'].map((v) => (
            <button 
              key={v}
              className={`px-4 py-2 transition-colors ${
                view === v 
                  ? 'bg-blue-600 text-white' 
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => onViewChange(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex justify-end items-center space-x-2">
        <button 
          onClick={goToPrevious}
          className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          className={`px-3 py-1 rounded-full ${
            darkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-white hover:bg-gray-100 text-black'
          } transition-colors shadow-md`}
          onClick={goToToday}
        >
          Today
        </button>
        <button 
          onClick={goToNext}
          className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;