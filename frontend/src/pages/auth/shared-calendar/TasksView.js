import React, { useState } from 'react';

const TasksView = () => {
  // State to track the current view (task or calendar)
  const [view, setView] = useState('tasks'); // 'tasks' or 'calendar'

  // State for toggling between personal and group tasks
  const [showPersonalTasks, setShowPersonalTasks] = useState(true);
  const [showGroupTasks, setShowGroupTasks] = useState(true);

  const toggleView = () => {
    setView(view === 'tasks' ? 'calendar' : 'tasks');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Shared Calendar - Tasks and Events</h1>
      
      {/* Toggle Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setShowPersonalTasks(!showPersonalTasks)}
          className={`px-4 py-2 rounded ${showPersonalTasks ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          {showPersonalTasks ? 'Hide' : 'Show'} Personal Tasks
        </button>
        <button
          onClick={() => setShowGroupTasks(!showGroupTasks)}
          className={`px-4 py-2 rounded ${showGroupTasks ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
        >
          {showGroupTasks ? 'Hide' : 'Show'} Group Tasks
        </button>
        <button
          onClick={toggleView}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Switch to {view === 'tasks' ? 'Calendar' : 'Task'} View
        </button>
      </div>

      {/* Conditionally Render Task or Calendar View */}
      {view === 'tasks' ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Tasks</h2>
          {showPersonalTasks && (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h3 className="text-lg font-semibold">Personal Tasks</h3>
              {/* Map over personal tasks */}
              <ul>
                <li>Task 1: Complete personal project</li>
                <li>Task 2: Review personal goals</li>
              </ul>
            </div>
          )}
          {showGroupTasks && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="text-lg font-semibold">Group Tasks</h3>
              {/* Map over group tasks */}
              <ul>
                <li>Task 1: Plan group event</li>
                <li>Task 2: Prepare group presentation</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Calendar View</h2>
          <p>Calendar displaying events for selected tasks and groups here.</p>
          {/* Calendar component goes here */}
        </div>
      )}
    </div>
  );
};

export default TasksView;
