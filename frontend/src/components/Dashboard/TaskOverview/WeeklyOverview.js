import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MAX_VISIBLE_TASKS = 3;

const WeeklyOverviewComponent = ({ data, onUpdateData }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const onDragStart = (e, dayIndex, fromCategory, taskIndex) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ dayIndex, fromCategory, taskIndex }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, toDayIndex, toCategory) => {
    e.preventDefault();
    const { dayIndex: fromDayIndex, fromCategory, taskIndex } = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (fromDayIndex === toDayIndex && fromCategory !== toCategory) {
      const newData = [...data];
      newData[toDayIndex] = {
        ...newData[toDayIndex],
        [fromCategory]: newData[toDayIndex][fromCategory] - 1,
        [toCategory]: newData[toDayIndex][toCategory] + 1
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
    const totalEvents = dayData.completed + dayData.missed + dayData.upcoming;

    return (
      <div className="p-3 max-w-xs bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-[400px] overflow-y-auto">
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{dayData.name} - Total Events: {totalEvents}</h4>
        <div className="space-y-2">
          {['completed', 'missed', 'upcoming'].map((category) => {
            const isExpanded = expandedCategories[`${dayIndex}-${category}`];
            const tasksToShow = isExpanded ? dayData[category] : Math.min(dayData[category], MAX_VISIBLE_TASKS);

            return (
              <div
                key={category}
                className={`p-2 rounded ${
                  category === 'completed' ? 'bg-green-100 dark:bg-green-800' :
                  category === 'missed' ? 'bg-red-100 dark:bg-red-800' :
                  'bg-blue-100 dark:bg-blue-800'
                }`}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, dayIndex, category)}
              >
                <h5 className={`font-medium text-sm ${
                  category === 'completed' ? 'text-green-800 dark:text-green-200' :
                  category === 'missed' ? 'text-red-800 dark:text-red-200' :
                  'text-blue-800 dark:text-blue-200'
                }`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({dayData[category]}):
                </h5>
                <div className="space-y-1 mt-1">
                  {[...Array(tasksToShow)].map((_, taskIndex) => (
                    <div
                      key={taskIndex}
                      draggable
                      onDragStart={(e) => onDragStart(e, dayIndex, category, taskIndex)}
                      className={`p-1 rounded-full text-xs ${
                        category === 'completed' ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200' :
                        category === 'missed' ? 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200' :
                        'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
                      } cursor-move hover:opacity-80 transition-opacity duration-200 flex items-center`}
                    >
                      <span className="w-3 h-3 rounded-full bg-current mr-1 flex-shrink-0"></span>
                      <span className="truncate">Task {taskIndex + 1}</span>
                    </div>
                  ))}
                </div>
                {dayData[category] > MAX_VISIBLE_TASKS && (
                  <button 
                    onClick={() => toggleCategory(dayIndex, category)}
                    className="mt-1 text-xs font-medium flex items-center justify-center w-full"
                  >
                    {isExpanded ? (
                      <>View Less <ChevronUp size={12} className="ml-1" /></>
                    ) : (
                      <>View More ({dayData[category] - MAX_VISIBLE_TASKS}) <ChevronDown size={12} className="ml-1" /></>
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
      <div className="grid grid-cols-7 gap-4">
        {data.map((dayData, index) => (
          <Tooltip key={dayData.name}>
            <TooltipTrigger asChild>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{dayData.name}</h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-green-600 dark:text-green-400">✓ {dayData.completed}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-red-600 dark:text-red-400">✗ {dayData.missed}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-blue-600 dark:text-blue-400">◷ {dayData.upcoming}</span>
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="p-0">
              {renderTooltipContent(dayData, index)}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default WeeklyOverviewComponent;