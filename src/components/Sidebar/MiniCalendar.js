import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const MiniCalendar = ({ onDateSelect, currentView, onViewChange, selectedDate }) => {
  const { darkMode } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setCurrentDate(selectedDate || new Date());
  }, [selectedDate]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(clickedDate);
  };

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex justify-between items-center mb-2">
        <button onClick={prevMonth}><ChevronLeft size={20} /></button>
        <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={nextMonth}><ChevronRight size={20} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => (
          <div key={day} className="text-center text-sm font-bold">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="text-center p-1"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isSelected = selectedDate && 
                             selectedDate.getDate() === day && 
                             selectedDate.getMonth() === currentDate.getMonth() &&
                             selectedDate.getFullYear() === currentDate.getFullYear();
          const isToday = new Date().getDate() === day && 
                          new Date().getMonth() === currentDate.getMonth() && 
                          new Date().getFullYear() === currentDate.getFullYear();
          
          return (
            <div 
              key={day} 
              onClick={() => handleDateClick(day)}
              className={`text-center p-1 text-sm cursor-pointer rounded-full
                ${isToday ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                ${isSelected && !isToday ? 'bg-gray-200' : ''}
                ${!isSelected && !isToday ? 'hover:bg-gray-200' : ''}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;