'use client'

import React, { useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const RecentCheckIns = ({ darkMode }) => {
  const [events, setEvents] = useState([
    { id: 1, title: "Team Meeting", date: "2024-08-15 14:00", status: "pending" },
    { id: 2, title: "Project Deadline", date: "2024-08-10 17:00", status: "pending" },
    { id: 3, title: "Client Presentation", date: "2024-08-20 10:00", status: "pending" },
  ]);
  const [showLog, setShowLog] = useState(false);
  const [activityLog, setActivityLog] = useState([
    { timestamp: "2024-08-05 09:30", user: "Alice", action: "completed task", details: "Update presentation" },
    { timestamp: "2024-08-05 11:45", user: "Bob", action: "started new task", details: "Design new logo" },
    { timestamp: "2024-08-06 14:20", user: "You", action: "marked as completed", details: "Team Meeting" },
    { timestamp: "2024-08-07 10:00", user: "Charlie", action: "commented", details: "Great job on the presentation!" },
    { timestamp: "2024-08-07 16:30", user: "You", action: "marked as missed", details: "Client Call" },
  ]);

  const handleEventStatus = (id, status) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, status } : event
    ));
    const updatedEvent = events.find(event => event.id === id);
    setActivityLog([
      {
        timestamp: new Date().toLocaleString(),
        user: "You",
        action: `marked as ${status}`,
        details: updatedEvent.title
      },
      ...activityLog
    ]);
  };

  return (
    <Card className={`h-full rounded-xl shadow-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white'} 
      border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <CardHeader className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <CardTitle className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Upcoming events
          </CardTitle>
          <button
            onClick={() => setShowLog(!showLog)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full 
              ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
              transition-all duration-200 border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
          >
            <ClipboardList size={16} />
            <span>{showLog ? 'View Events' : 'Activity Log'}</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!showLog ? (
          <ul className="space-y-4">
            {events.map(event => (
              <li 
                key={event.id} 
                className={`p-4 rounded-xl transition-all duration-200
                  ${darkMode ? 'bg-gray-900/90 hover:bg-gray-900' : 'bg-gray-50 hover:bg-gray-100'}
                  border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full 
                      ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
                      <Clock className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={20} />
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {event.title}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(event.date).toLocaleString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEventStatus(event.id, 'completed')}
                      className={`p-2 rounded-full hover:bg-green-500/10 text-green-400 transition-colors duration-200
                        ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleEventStatus(event.id, 'missed')}
                      className={`p-2 rounded-full hover:bg-red-500/10 text-red-400 transition-colors duration-200
                        ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-4">
            {activityLog.map((log, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl text-sm transition-all duration-200
                  ${darkMode ? 'bg-gray-900/90 hover:bg-gray-900' : 'bg-gray-50 hover:bg-gray-100'}
                  border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full shrink-0
                    ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
                    <ClipboardList className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs
                        ${darkMode ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {log.user}
                      </span>
                    </div>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {log.action} <span className="font-medium">"{log.details}"</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentCheckIns;