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
  const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day, isCurrentMonth) => {
    if (isCurrentMonth) {
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      onDateSelect(clickedDate);
    } else {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + (day > 20 ? -1 : 1), day);
      setCurrentDate(newDate);
      onDateSelect(newDate);
    }
  };

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const renderCalendarDays = () => {
    const calendarDays = [];
    const totalDays = 42; // 6 rows * 7 days

    for (let i = 0; i < totalDays; i++) {
      if (i < firstDayOfMonth) {
        // Previous month
        const day = daysInPrevMonth - firstDayOfMonth + i + 1;
        calendarDays.push({ day, isCurrentMonth: false });
      } else if (i < firstDayOfMonth + daysInMonth) {
        // Current month
        const day = i - firstDayOfMonth + 1;
        calendarDays.push({ day, isCurrentMonth: true });
      } else {
        // Next month
        const day = i - (firstDayOfMonth + daysInMonth) + 1;
        calendarDays.push({ day, isCurrentMonth: false });
      }
    }

    return calendarDays;
  };

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
        {renderCalendarDays().map(({ day, isCurrentMonth }, index) => {
          const isSelected = selectedDate && 
                             selectedDate.getDate() === day && 
                             selectedDate.getMonth() === currentDate.getMonth() &&
                             selectedDate.getFullYear() === currentDate.getFullYear() &&
                             isCurrentMonth;
          const isToday = new Date().getDate() === day && 
                          new Date().getMonth() === currentDate.getMonth() && 
                          new Date().getFullYear() === currentDate.getFullYear() &&
                          isCurrentMonth;
          
          return (
            <div 
              key={index} 
              onClick={() => handleDateClick(day, isCurrentMonth)}
              className={`text-center p-1 text-sm cursor-pointer rounded-full
                ${isCurrentMonth ? '' : 'text-gray-500'}
                ${isToday ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                ${isSelected && !isToday ? 'bg-gray-200' : ''}
                ${!isSelected && !isToday && isCurrentMonth ? 'hover:bg-gray-200' : ''}
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