import React from 'react';

const WeeklyOverviewComponent = ({ data }) => {
  return (
    <div className="grid grid-cols-7 gap-4">
      {data.map((dayData) => (
        <div key={dayData.name} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
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
      ))}
    </div>
  );
};

export default WeeklyOverviewComponent;