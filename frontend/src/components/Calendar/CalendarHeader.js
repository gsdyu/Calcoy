import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const CalendarHeader = ({ currentDate, view, onDateChange, onViewChange }) => {
  const { selectedTheme, presetThemes, colors } = useTheme();

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
            <span className={`font-normal ${colors.textSecondary} ml-1`}>{year}</span>
          </>
        );
      } else {
        return (
          <>
            <span className="font-bold">{`${startMonth} - ${endMonth}`}</span>
            <span className={`font-normal ${colors.textSecondary} ml-1`}>{year}</span>
          </>
        );
      }
    } else {
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();
      return (
        <>
          <span className="font-bold">{month}</span>
          <span className={`font-normal ${colors.textSecondary} ml-1`}>{year}</span>
        </>
      );
    }
  };

  // Get background styles based on selected theme
  const getBackgroundStyles = () => {
    if (selectedTheme && presetThemes[selectedTheme]) {
      return presetThemes[selectedTheme].gradient;
    }
    return colors.background;
  };

  return (
    <div className={`
      flex items-center p-4 
      ${getBackgroundStyles()}
      text-sm border-b ${colors.buttonBorder}
    `}>
      <div className="flex-1">
        <h2 className={`text-lg font-semibold ${colors.text}`}>
          {formatHeaderDate()}
        </h2>
      </div>
      
      <div className="flex-1 flex justify-center">
        <div className="flex rounded-xl overflow-hidden shadow-md">
          {['Day', 'Week', 'Month'].map((v) => (
            <button 
              key={v}
              className={`
                px-4 py-2 transition-all 
                ${view === v 
                  ? 'bg-blue-500 text-white' 
                  : `${colors.buttonBg} ${colors.text}`
                }
              `}
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
          className={`
            p-2 rounded-xl
            ${colors.buttonBg}
            ${colors.text}
            transition-colors
          `}
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          className={`
            px-4 py-1.5 rounded-xl font-medium
            ${colors.buttonBg}
            ${colors.text}
            transition-colors shadow-md
          `}
          onClick={goToToday}
        >
          Today
        </button>
        <button 
          onClick={goToNext}
          className={`
            p-2 rounded-xl
            ${colors.buttonBg}
            ${colors.text}
            transition-colors
          `}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;