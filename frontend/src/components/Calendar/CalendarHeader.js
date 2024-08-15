import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const CalendarHeader = ({ currentDate, view, onDateChange, onViewChange, onAddEvent }) => {
  const { darkMode } = useTheme();

  const goToToday = () => onDateChange(new Date());

  return (
    <div className={`flex justify-between items-center p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} text-sm`}>
      <div className="flex items-center space-x-2">
        <button 
          className={`px-3 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded`} 
          onClick={goToToday}
        >
          Today
        </button>
        <button onClick={() => onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
          <ChevronRight size={16} />
        </button>
        <h2 className="text-base font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
      </div>
      <div className="flex items-center space-x-2">
        <div className="mr-2 text-sm font-medium">
          My Calendar
        </div>
        <div className="flex rounded-md overflow-hidden">
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