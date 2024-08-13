import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const CalendarHeader = ({ currentDate, view, onDateChange, onViewChange, onAddEvent }) => {
  const { darkMode } = useTheme();

  const goToToday = () => onDateChange(new Date());

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'Day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'Week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'Day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'Week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const formatHeaderDate = () => {
    if (view === 'Day') {
      return currentDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (view === 'Week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.toLocaleString('default', { month: 'long' })} ${weekStart.getFullYear()}`;
      } else {
        return `${weekStart.toLocaleString('default', { month: 'short' })} - ${weekEnd.toLocaleString('default', { month: 'short' })} ${weekEnd.getFullYear()}`;
      }
    } else {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className={`flex justify-between items-center p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} text-sm`}>
      <div className="flex items-center space-x-2">
        <button 
          className={`px-3 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded`} 
          onClick={goToToday}
        >
          Today
        </button>
        <button onClick={goToPrevious}>
          <ChevronLeft size={16} />
        </button>
        <button onClick={goToNext}>
          <ChevronRight size={16} />
        </button>
        <h2 className="text-base font-semibold">
          {formatHeaderDate()}
        </h2>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex rounded-md overflow-hidden">
          <button 
            className={`px-3 py-1 ${view === 'Day' ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'}`} 
            onClick={() => onViewChange('Day')}
          >
            Day
          </button>
          <button 
            className={`px-3 py-1 ${view === 'Week' ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'}`} 
            onClick={() => onViewChange('Week')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1 ${view === 'Month' ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'}`} 
            onClick={() => onViewChange('Month')}
          >
            Month
          </button>
        </div>
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded-md flex items-center" 
          onClick={onAddEvent}
        >
          <Plus size={16} className="mr-1" /> Add
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;