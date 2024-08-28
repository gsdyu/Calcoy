'use client'

import React, { useState } from 'react';
import { Plus, Calendar, Activity, ChevronLeft, ChevronRight, ClipboardList, CheckCircle, XCircle } from 'lucide-react';

const Card = ({ children, className }) => (
  <div className={`bg-gray-800 rounded-lg shadow-md ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => <div className="p-4 border-b border-gray-700">{children}</div>;
const CardTitle = ({ children }) => <h2 className="text-lg font-semibold text-white">{children}</h2>;
const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const DashboardHeader = () => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
    <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md">
      <Plus size={20} />
      <span>Add Event</span>
    </button>
  </div>
);

const ActivityHeatmap = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getMonthData = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    let calendarData = [];
    for (let i = 0; i < startingDay; i++) {
      calendarData.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const eventCount = Math.floor(Math.random() * 5);
      calendarData.push({ date, eventCount });
    }
    return calendarData;
  };

  const monthData = getMonthData(currentDate.getFullYear(), currentDate.getMonth());

  const getColor = (eventCount) => {
    if (eventCount === null) return 'bg-transparent';
    if (eventCount === 0) return 'bg-gray-700';
    if (eventCount === 1) return 'bg-blue-800';
    if (eventCount === 2) return 'bg-blue-600';
    if (eventCount === 3) return 'bg-blue-400';
    return 'bg-blue-200';
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => changeMonth(-1)} className="p-1 text-gray-400 hover:text-white"><ChevronLeft size={16} /></button>
        <h3 className="text-xs font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={() => changeMonth(1)} className="p-1 text-gray-400 hover:text-white"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(day => (
          <div key={day} className="text-[8px] font-semibold text-center text-gray-400 mb-1">{day}</div>
        ))}
        {monthData.map((data, index) => (
          <div
            key={index}
            className={`w-4 h-4 ${getColor(data?.eventCount)} rounded-sm flex items-center justify-center`}
            title={data ? `${data.date.toDateString()}: ${data.eventCount} events` : ''}
          >
            {data && <span className="text-[6px]">{data.date.getDate()}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const WeeklyActivity = () => {
  const weekData = [
    { day: 'Mon', events: 4 },
    { day: 'Tue', events: 3 },
    { day: 'Wed', events: 2 },
    { day: 'Thu', events: 5 },
    { day: 'Fri', events: 4 },
    { day: 'Sat', events: 3 },
    { day: 'Sun', events: 1 },
  ];

  return (
    <div className="space-y-1">
      {weekData.map(({ day, events }) => (
        <div key={day} className="flex items-center">
          <span className="w-8 text-xs text-gray-400">{day}:</span>
          <div className="flex-grow h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${(events / 5) * 100}%` }}
            ></div>
          </div>
          <span className="ml-2 text-xs text-gray-400">{events}</span>
        </div>
      ))}
    </div>
  );
};

const ActivityOverview = () => {
  const [viewType, setViewType] = useState('heatmap');

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Activity Overview</CardTitle>
          <div className="flex space-x-2">
            <button
              className={`px-2 py-1 rounded-md ${viewType === 'heatmap' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setViewType('heatmap')}
            >
              <Calendar size={14} />
            </button>
            <button
              className={`px-2 py-1 rounded-md ${viewType === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setViewType('weekly')}
            >
              <Activity size={14} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewType === 'heatmap' ? <ActivityHeatmap /> : <WeeklyActivity />}
      </CardContent>
    </Card>
  );
};

const AIRecommendations = () => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>AI Recommendations</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2 text-white">
        <li className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Schedule a break between long meetings</span>
        </li>
        <li className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Set a reminder for upcoming project milestone</span>
        </li>
      </ul>
    </CardContent>
  </Card>
);

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
        <div className="grid grid-cols-3 gap-6">
          <ActivityOverview />
          <AIRecommendations />
          <div className="col-span-3">
            <RecentCheckIns />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;