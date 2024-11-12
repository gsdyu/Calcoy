'use client'

import React, { useState } from 'react';
import { ClipboardList, Clock, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const RecentCheckIns = ({ darkMode, events, onTaskComplete }) => {
  const [showLog, setShowLog] = useState(false);

  // Filter and sort tasks with time buffer (next 2 hours and incomplete tasks)
  const getUpcomingTasks = () => {
    if (!events) return [];

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));

    return events
      .filter(event => {
        if (event.calendar !== 'Task') return false;
        const taskTime = new Date(event.start_time);
        return taskTime > twoHoursAgo || !event.completed;
      })
      .sort((a, b) => {
        const dateA = new Date(a.start_time);
        const dateB = new Date(b.start_time);
        return dateA - dateB;
      });
  };

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

  const upcomingTasks = getUpcomingTasks();

  return (
    <Card className={`h-full rounded-xl shadow-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white'} 
      border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <CardHeader className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <CardTitle className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Upcoming Tasks
          </CardTitle>
          <div className={`text-sm px-4 py-2 rounded-full 
            ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {upcomingTasks.length} tasks
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
          {upcomingTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-xl transition-all duration-200
                ${darkMode ? 'bg-gray-900/90 hover:bg-gray-900' : 'bg-gray-50 hover:bg-gray-100'}
                border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
                ${task.completed ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div 
                  onClick={() => handleTaskClick(task.id, task.completed)}
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
                  <div className={`font-medium ${
                    task.completed ? 'line-through' : ''
                  } ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mr-1`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(task.start_time)}
                      {!task.allDay && ` • ${new Date(task.start_time).toLocaleTimeString('en-US', { 
                        hour: 'numeric',
                        minute: '2-digit'
                      })}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {upcomingTasks.length === 0 && (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No upcoming tasks
            </div>
          )}
        </div>
      </CardContent>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(107, 114, 128, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.5);
        }
      `}</style>
    </Card>
  );
};

export default RecentCheckIns;