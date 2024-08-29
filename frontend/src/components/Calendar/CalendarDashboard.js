'use client'

import React, { useState } from 'react';
import { Calendar, ClipboardList, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Card = ({ children, className }) => (
  <div className={`bg-gray-800 rounded-lg shadow-md ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => <div className="p-4 border-b border-gray-700">{children}</div>;
const CardTitle = ({ children }) => <h2 className="text-lg font-semibold text-white">{children}</h2>;
const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const DashboardHeader = () => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
  </div>
);


const TaskCompletionComponent = () => {
  const [timeFrame, setTimeFrame] = useState('week');

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // This function simulates task data generation
  // In the future, this will be replaced with actual data from the backend
  const generateTaskData = () => {
    const currentDate = new Date();
    const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    
    return [...Array(7)].map((_, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);
      const dateString = date.toISOString().split('T')[0];
      const isToday = dateString === getCurrentDate();
      const isPast = date < new Date(getCurrentDate());

      // Requirements:
      // 1. Previous days: completed + missed tasks
      // 2. Future days: completed (early finish) + upcoming tasks
      // 3. Today: completed + upcoming + missed tasks (only day with all three)
      let completed = Math.floor(Math.random() * 5);
      let missed = 0;
      let upcoming = 0;

      if (isPast) {
        missed = Math.floor(Math.random() * 3);
      } else if (isToday) {
        missed = Math.floor(Math.random() * 2);
        upcoming = Math.floor(Math.random() * 3);
      } else {
        upcoming = Math.floor(Math.random() * 5);
      }

      const total = completed + missed + upcoming;

      return {
        name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()],
        date: dateString,
        completed,
        missed,
        upcoming,
        total
      };
    });
  };

  const taskData = generateTaskData();

  // Calculate completion rate
  const totalCompleted = taskData.reduce((acc, day) => acc + day.completed, 0);
  const totalTasks = taskData.reduce((acc, day) => acc + day.completed + day.missed, 0);
  const completionRate = totalTasks > 0 ? ((totalCompleted / totalTasks) * 100).toFixed(1) : '0.0';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-4 rounded shadow-lg">
          <p className="text-white font-bold">{label}</p>
          <p className="text-green-400">Completed: {data.completed}</p>
          <p className="text-red-400">Missed: {data.missed}</p>
          <p className="text-blue-400">Upcoming: {data.upcoming}</p>
          <p className="text-white font-bold mt-2">Total: {data.total}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Task Completion Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-400" />
            <span className="text-white text-xl font-semibold">{completionRate}% Completion Rate</span>
          </div>
          <select 
            value={timeFrame} 
            onChange={(e) => setTimeFrame(e.target.value)}
            className="bg-gray-700 text-white rounded p-2"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={taskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
            <Bar dataKey="missed" stackId="a" fill="#EF4444" name="Missed" />
            <Bar dataKey="upcoming" stackId="a" fill="#3B82F6" name="Upcoming" />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="text-green-400" />
              <span className="text-white font-semibold">Completed Tasks</span>
            </div>
            <p className="text-2xl font-bold text-white">{taskData.reduce((sum, day) => sum + day.completed, 0)}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="text-red-400" />
              <span className="text-white font-semibold">Missed Tasks</span>
            </div>
            <p className="text-2xl font-bold text-white">{taskData.reduce((sum, day) => sum + day.missed, 0)}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="text-blue-400" />
              <span className="text-white font-semibold">Upcoming Tasks</span>
            </div>
            <p className="text-2xl font-bold text-white">{taskData.reduce((sum, day) => sum + day.upcoming, 0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Later connect to AI(Train to respond something on the lines of this (Can learn from completions))
const AIInsightsComponent = () => { 
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-start space-x-2 text-white">
            <Calendar className="text-purple-400 mt-1 flex-shrink-0" />
            <span>You're most productive on Tuesdays. Consider scheduling important tasks for this day.</span>
          </li>
          <li className="flex items-start space-x-2 text-white">
            <AlertTriangle className="text-yellow-400 mt-1 flex-shrink-0" />
            <span>You often miss tasks scheduled after 4 PM. Try rescheduling these to earlier in the day.</span>
          </li>
          <li className="flex items-start space-x-2 text-white">
            <CheckCircle className="text-green-400 mt-1 flex-shrink-0" />
            <span>Great job on completing all your high-priority tasks this week!</span>
          </li>
          <li className="flex items-start space-x-2 text-white">
            <Clock className="text-blue-400 mt-1 flex-shrink-0" />
            <span>You have 3 upcoming deadlines this week. Consider starting on them early.</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

const RecentCheckIns = () => {
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Check-ins</CardTitle>
          <button
            onClick={() => setShowLog(!showLog)}
            className="flex items-center space-x-2 bg-gray-700 text-white px-3 py-1 rounded-md"
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
              <li key={event.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
                <div>
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="text-sm text-gray-400">{new Date(event.date).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEventStatus(event.id, 'completed')}
                    className="p-1 text-green-400 hover:text-green-300"
                    title="Mark as completed"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button 
                    onClick={() => handleEventStatus(event.id, 'missed')}
                    className="p-1 text-red-400 hover:text-red-300"
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
            <h3 className="text-lg font-semibold mb-3">Activity Log</h3>
            <ul className="space-y-2">
              {activityLog.map((log, index) => (
                <li key={index} className="text-sm flex items-start space-x-2">
                  <span className="text-gray-400 whitespace-nowrap">{log.timestamp}</span>
                  <span className="text-blue-400">{log.user}</span>
                  <span className="text-white">{log.action}</span>
                  <span className="text-gray-300">"{log.details}"</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <DashboardHeader />
        <div className="grid grid-cols-1 gap-6">
          <TaskCompletionComponent />
          <AIInsightsComponent />
          <RecentCheckIns />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;