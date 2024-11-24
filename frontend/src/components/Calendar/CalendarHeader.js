import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const CalendarHeader = ({ currentDate, view, onDateChange, onViewChange }) => {
  const { darkMode } = useTheme();

  const goToToday = () => onDateChange(new Date(), 'none');
  
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'Day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'Week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate, 'left');
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'Day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'Week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + 1);
    }
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
    <div className={`flex items-center p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} text-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
      <div className="flex-1">
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {formatHeaderDate()}
        </h2>
      </div>
      
      <div className="flex-1 flex justify-center">
        <div className="flex rounded-xl overflow-hidden shadow-md">
          {['Day', 'Week', 'Month'].map((v) => (
            <button 
              key={v}
              className={`px-4 py-2 transition-all ${
                view === v 
                  ? 'bg-blue-500 text-white' 
                  : darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => onViewChange(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex justify-end items-center space-x-3">
        <button 
          onClick={goToPrevious}
          className={`p-2 rounded-xl ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'
          } transition-colors`}
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          className={`px-4 py-1.5 rounded-xl font-medium ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-white hover:bg-gray-100 text-gray-700'
          } transition-colors shadow-md`}
          onClick={goToToday}
        >
          Today
        </button>
        <button 
          onClick={goToNext}
          className={`p-2 rounded-xl ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'
          } transition-colors`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;