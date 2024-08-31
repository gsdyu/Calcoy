import React from 'react';

const MonthlyCalendarView = ({ data, year, month }) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const days = [...Array(firstDayOfMonth).fill(null), ...data];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{monthNames[month]} {year}</h2>
      <div className="grid grid-cols-7 gap-4">
        {weekdays.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            {day && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{day.day}</h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-green-600 dark:text-green-400">✓ {day.completed}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-red-600 dark:text-red-400">✗ {day.missed}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-blue-600 dark:text-blue-400">◷ {day.upcoming}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyCalendarView;