import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MAX_VISIBLE_TASKS = 3;

const MonthlyCalendarView = ({ data, year, month, onUpdateData, darkMode }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const days = [...Array(firstDayOfMonth).fill(null), ...data];

  const onDragStart = (e, dayIndex, fromCategory, taskIndex) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ dayIndex, fromCategory, taskIndex }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, dayIndex, toCategory) => {
    e.preventDefault();
    const { dayIndex: fromDayIndex, fromCategory, taskIndex } = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (fromDayIndex !== dayIndex || fromCategory !== toCategory) {
      const newData = [...data];
      newData[fromDayIndex] = {
        ...newData[fromDayIndex],
        [fromCategory]: newData[fromDayIndex][fromCategory] - 1
      };
      newData[dayIndex] = {
        ...newData[dayIndex],
        [toCategory]: newData[dayIndex][toCategory] + 1
      };
      onUpdateData(newData);
    }
  };

  const toggleCategory = (dayIndex, category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [`${dayIndex}-${category}`]: !prev[`${dayIndex}-${category}`]
    }));
  };

  const renderTooltipContent = (dayData, dayIndex) => {
    if (!dayData) return null;
    const totalEvents = dayData.completed + dayData.missed + dayData.upcoming;

    return (
      <div className={`p-3 max-w-xs ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg max-h-[300px] overflow-y-auto`}>
        <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'} text-sm`}>Day {dayData.day} - Total Events: {totalEvents}</h4>
        <div className="space-y-2">
          {['completed', 'missed', 'upcoming'].map((category) => {
            const isExpanded = expandedCategories[`${dayIndex}-${category}`];
            const tasksToShow = isExpanded ? dayData[category] : Math.min(dayData[category], MAX_VISIBLE_TASKS);

            return (
              <div
                key={category}
                className={`p-2 rounded ${
                  category === 'completed' ? (darkMode ? 'bg-green-800' : 'bg-green-100') :
                  category === 'missed' ? (darkMode ? 'bg-red-800' : 'bg-red-100') :
                  (darkMode ? 'bg-blue-800' : 'bg-blue-100')
                }`}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, dayIndex - firstDayOfMonth, category)}
              >
                <h5 className={`font-medium text-xs ${
                  category === 'completed' ? (darkMode ? 'text-green-200' : 'text-green-800') :
                  category === 'missed' ? (darkMode ? 'text-red-200' : 'text-red-800') :
                  (darkMode ? 'text-blue-200' : 'text-blue-800')
                }`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({dayData[category]}):
                </h5>
                <div className="space-y-1 mt-1">
                  {[...Array(tasksToShow)].map((_, taskIndex) => (
                    <div
                      key={taskIndex}
                      draggable
                      onDragStart={(e) => onDragStart(e, dayIndex - firstDayOfMonth, category, taskIndex)}
                      className={`p-1 rounded-full text-xs ${
                        category === 'completed' ? (darkMode ? 'bg-green-700 text-green-200' : 'bg-green-200 text-green-800') :
                        category === 'missed' ? (darkMode ? 'bg-red-700 text-red-200' : 'bg-red-200 text-red-800') :
                        (darkMode ? 'bg-blue-700 text-blue-200' : 'bg-blue-200 text-blue-800')
                      } cursor-move hover:opacity-80 transition-opacity duration-200 flex items-center`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current mr-1 flex-shrink-0"></span>
                      <span className="truncate">Task {taskIndex + 1}</span>
                    </div>
                  ))}
                </div>
                {dayData[category] > MAX_VISIBLE_TASKS && (
                  <button 
                    onClick={() => toggleCategory(dayIndex, category)}
                    className={`mt-1 text-xs font-medium flex items-center justify-center w-full ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    {isExpanded ? (
                      <>View Less <ChevronUp size={10} className="ml-1" /></>
                    ) : (
                      <>View More ({dayData[category] - MAX_VISIBLE_TASKS}) <ChevronDown size={10} className="ml-1" /></>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{monthNames[month]} {year}</h2>
        <div className="grid grid-cols-7 gap-2">
        {weekdays.map(day => (
            <div key={day} className={`text-center font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-2 rounded-lg shadow-md border cursor-pointer h-24 overflow-hidden`}>
                  {day && (
                    <>
                      <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-1`}>{day.day}</h3>
                      <div className="space-y-0.5 text-xs">
                        <p>
                          <span className={darkMode ? 'text-green-400' : 'text-green-600'}>✓ {day.completed}</span>
                        </p>
                        <p>
                          <span className={darkMode ? 'text-red-400' : 'text-red-600'}>✗ {day.missed}</span>
                        </p>
                        <p>
                          <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>◷ {day.upcoming}</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="p-0">
                {renderTooltipContent(day, index)}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MonthlyCalendarView;