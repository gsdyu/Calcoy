import React, { useState } from 'react';

const SharedCalendarPage = () => {
  const [viewMode, setViewMode] = useState('tasks'); // Toggle between 'tasks' and 'calendar'

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Shared Calendar</h1>

      {/* Toggle Buttons for Task and Calendar Views */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => toggleViewMode('tasks')} 
          className={`px-4 py-2 rounded ${viewMode === 'tasks' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Task View
        </button>
        <button 
          onClick={() => toggleViewMode('calendar')} 
          className={`px-4 py-2 rounded ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Calendar View
        </button>
      </div>

      {/* Render Task or Calendar view based on selection */}
      <div className="mt-4">
        {viewMode === 'tasks' ? (
          <TaskView />
        ) : (
          <CalendarView />
        )}
      </div>
    </div>
  );
};

const TaskView = () => {
  // Placeholder component to display tasks
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Tasks</h2>
      <ul>
        <li>Task 1 - Complete by 2 PM</li>
        <li>Task 2 - Complete by 4 PM</li>
        {/* More tasks here */}
      </ul>
    </div>
  );
};

const CalendarView = () => {
  // Placeholder component for calendar display
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Calendar</h2>
      <p>This is the calendar view, showing events scheduled for each day.</p>
      {/* Calendar events or calendar component here */}
    </div>
  );
};

export default SharedCalendarPage;
