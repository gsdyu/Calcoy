import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const WeeklyOverviewComponent = ({ data, onUpdateData }) => {
  const onDragStart = (e, dayIndex, fromCategory, taskIndex) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ dayIndex, fromCategory, taskIndex }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, dayIndex, toCategory) => {
    e.preventDefault();
    const { dayIndex: fromDayIndex, fromCategory, taskIndex } = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (fromDayIndex === dayIndex && fromCategory !== toCategory) {
      const newData = [...data];
      newData[dayIndex] = {
        ...newData[dayIndex],
        [fromCategory]: newData[dayIndex][fromCategory] - 1,
        [toCategory]: newData[dayIndex][toCategory] + 1
      };
      onUpdateData(newData);
    }
  };

  const renderTooltipContent = (dayData, dayIndex) => {
    const totalEvents = dayData.completed + dayData.missed + dayData.upcoming;

    return (
      <div className="p-3 max-w-xs bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{dayData.name} - Total Events: {totalEvents}</h4>
        <div className="space-y-2">
          {['completed', 'missed', 'upcoming'].map((category) => (
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
              <h5 className={`font-medium ${
                category === 'completed' ? 'text-green-800 dark:text-green-200' :
                category === 'missed' ? 'text-red-800 dark:text-red-200' :
                'text-blue-800 dark:text-blue-200'
              }`}>
                {category.charAt(0).toUpperCase() + category.slice(1)} ({dayData[category]}):
              </h5>
              <ul className="list-disc list-inside">
                {[...Array(dayData[category])].map((_, taskIndex) => (
                  <li
                    key={taskIndex}
                    draggable
                    onDragStart={(e) => onDragStart(e, dayIndex, category, taskIndex)}
                    className={`text-sm ${
                      category === 'completed' ? 'text-green-700 dark:text-green-300' :
                      category === 'missed' ? 'text-red-700 dark:text-red-300' :
                      'text-blue-700 dark:text-blue-300'
                    } cursor-move`}
                  >
                    Task {taskIndex + 1}
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer">
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