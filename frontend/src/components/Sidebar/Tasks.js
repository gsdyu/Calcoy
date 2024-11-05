import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Check, Clock } from 'lucide-react';

const Tasks = ({ events, selectedDate, onTaskComplete }) => {
  const { darkMode } = useTheme();
  const [displayMode, setDisplayMode] = useState('upcoming');
  
  // Filter and sort tasks with time buffer
  const getTasks = () => {
    if (!events) return [];

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000)); // 2 hour buffer

    return events
      .filter(event => {
        if (event.calendar !== 'Task') return false;
        
        if (displayMode === 'upcoming') {
          const taskTime = new Date(event.start_time);
          return taskTime > twoHoursAgo || !event.completed;
        } else {
          // Selected day mode
          const taskDate = new Date(event.start_time);
          const selected = new Date(selectedDate);
          return taskDate.getDate() === selected.getDate() &&
                 taskDate.getMonth() === selected.getMonth() &&
                 taskDate.getFullYear() === selected.getFullYear();
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.start_time);
        const dateB = new Date(b.start_time);
        return dateA - dateB;
      });
  };

  const tasks = getTasks();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleTaskClick = (taskId, currentStatus) => {
    if (onTaskComplete) {
      onTaskComplete(taskId, !currentStatus);
    }
  };

  return (
    <div className={`p-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tasks</h3>
        
        {/* Compact Mode Switcher */}
        <div className={`text-xs ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-md overflow-hidden flex`}>
          <button
            onClick={() => setDisplayMode('upcoming')}
            className={`px-2 py-1 transition-colors ${
              displayMode === 'upcoming'
                ? 'bg-blue-500 text-white'
                : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setDisplayMode('selected')}
            className={`px-2 py-1 transition-colors ${
              displayMode === 'selected'
                ? 'bg-blue-500 text-white'
                : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            Selected
          </button>
        </div>
      </div>
      
      {tasks.length === 0 ? (
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No tasks {displayMode === 'selected' ? 'for selected day' : 'scheduled'}
        </p>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`group flex items-start space-x-3 ${
                task.completed ? 'opacity-50' : ''
              }`}
              onClick={() => handleTaskClick(task.id, task.completed)}
            >
              <div 
                className={`
                  flex-shrink-0 w-5 h-5 mt-0.5 rounded border cursor-pointer
                  ${darkMode ? 'border-gray-600' : 'border-gray-300'}
                  ${task.completed ? 'bg-blue-500 border-blue-500' : 'hover:border-blue-500'}
                  transition-colors duration-200
                `}
              >
                {task.completed && <Check className="w-4 h-4 text-white m-auto" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${
                  task.completed ? 'line-through' : ''
                } ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {task.title}
                </div>
                <div className="flex items-center mt-1">
                  <Clock className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mr-1`} />
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatDate(task.start_time)}
                    {!task.allDay && ` • ${new Date(task.start_time).toLocaleTimeString('en-US', { 
                      hour: 'numeric',
                      minute: '2-digit'
                    })}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;