'use client'

import React, { useState } from 'react';
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react';
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
    <Card className={darkMode ? 'bg-gray-800' : 'bg-white'}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className={darkMode ? 'text-gray-200' : 'text-gray-800'}>Recent Check-ins</CardTitle>
          <button
            onClick={() => setShowLog(!showLog)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md ${
              darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            <ClipboardList size={16} />
            <span>Activity Log</span>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {!showLog ? (
          <ul className="space-y-3">
            {events.map(event => (
              <li key={event.id} className={`flex items-center justify-between p-2 rounded-md ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{event.title}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(event.date).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEventStatus(event.id, 'completed')}
                    className={`p-1 ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'}`}
                    title="Mark as completed"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button 
                    onClick={() => handleEventStatus(event.id, 'missed')}
                    className={`p-1 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                    title="Mark as missed"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Activity Log</h3>
            <ul className="space-y-2">
              {activityLog.map((log, index) => (
                <li key={index} className="text-sm flex items-start space-x-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{log.timestamp}</span>
                  <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>{log.user}</span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{log.action}</span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>"{log.details}"</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentCheckIns;