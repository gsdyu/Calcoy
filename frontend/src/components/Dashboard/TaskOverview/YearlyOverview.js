import React from 'react';

const YearlyOverviewComponent = ({ data, darkMode }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {data.map((monthData) => (
        <div 
          key={monthData.name} 
          className={`p-4 rounded-lg shadow-md border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {monthData.name}
          </h3>
          <div className="space-y-1">
            <p className="text-sm">
              <span className={darkMode ? 'text-green-400' : 'text-green-600'}>
                ✓ {monthData.completed}
              </span>
            </p>
            <p className="text-sm">
              <span className={darkMode ? 'text-red-400' : 'text-red-600'}>
                ✗ {monthData.missed}
              </span>
            </p>
            <p className="text-sm">
              <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>
                ◷ {monthData.upcoming}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default YearlyOverviewComponent;