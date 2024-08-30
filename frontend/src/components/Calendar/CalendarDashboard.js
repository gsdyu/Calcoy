'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, ClipboardList, CheckCircle, XCircle, AlertTriangle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const DashboardHeader = () => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
  </div>
);

const generateData = (timeFrame, year, month) => {
  switch (timeFrame) {
    case 'week':
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
        name: day,
        completed: Math.floor(Math.random() * 10),
        missed: Math.floor(Math.random() * 5),
        upcoming: Math.floor(Math.random() * 7)
      }));
    case 'month':
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        completed: Math.floor(Math.random() * 5),
        missed: Math.floor(Math.random() * 3),
        upcoming: Math.floor(Math.random() * 4)
      }));
    case 'year':
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
        name: month,
        completed: Math.floor(Math.random() * 100),
        missed: Math.floor(Math.random() * 50),
        upcoming: Math.floor(Math.random() * 75)
      }));
    default:
      return [];
  }
};

const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
};

const WeeklyOverviewComponent = ({ data }) => {
  return (
    <div className="grid grid-cols-7 gap-4">
      {data.map((dayData) => (
        <div key={dayData.name} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{dayData.name}</h3>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-green-600 dark:text-green-400">✓ {dayData.completed}</span>
            </p>
            <p className="text-sm">
              <span className="text-red-600 dark:text-red-400">✗ {dayData.missed}</span>
            </p>
            <p className="text-sm">
              <span className="text-blue-600 dark:text-blue-400">◷ {dayData.upcoming}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const MonthlyCalendarView = ({ data, year, month }) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{monthNames[month]} {year}</h2>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekdays.map(day => (
          <div key={day} className="text-center font-bold text-gray-600 dark:text-gray-400 p-2">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2"></div>
        ))}
        {data.map((day) => (
          <div key={day.day} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center">
            <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{day.day}</div>
            <div className="flex flex-col items-center space-y-1 text-xs">
              <span className="text-green-600 dark:text-green-400">{day.completed} ✓</span>
              <span className="text-red-600 dark:text-red-400">{day.missed} ✗</span>
              <span className="text-blue-600 dark:text-blue-400">{day.upcoming} ◷</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const YearlyOverviewComponent = ({ data }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {data.map((monthData) => (
        <div key={monthData.name} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{monthData.name}</h3>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-green-600 dark:text-green-400">✓ {monthData.completed}</span>
            </p>
            <p className="text-sm">
              <span className="text-red-600 dark:text-red-400">✗ {monthData.missed}</span>
            </p>
            <p className="text-sm">
              <span className="text-blue-600 dark:text-blue-400">◷ {monthData.upcoming}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const TaskOverviewComponent = () => {
  const [timeFrame, setTimeFrame] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState({ week: 0, year: 0 });

  useEffect(() => {
    const { week, year } = getWeekNumber(selectedDate);
    setCurrentWeek({ week, year });
  }, [selectedDate]);

  const data = useMemo(() => generateData(timeFrame, selectedDate.getFullYear(), selectedDate.getMonth()), [timeFrame, selectedDate]);

  const { totalCompleted, totalMissed, totalUpcoming, completionRate } = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalCompleted: 0, totalMissed: 0, totalUpcoming: 0, completionRate: 0 };
    }
    const completed = data.reduce((sum, item) => sum + (item.completed || 0), 0);
    const missed = data.reduce((sum, item) => sum + (item.missed || 0), 0);
    const upcoming = data.reduce((sum, item) => sum + (item.upcoming || 0), 0);
    const rate = completed + missed > 0 ? ((completed / (completed + missed)) * 100).toFixed(1) : 0;
    return { totalCompleted: completed, totalMissed: missed, totalUpcoming: upcoming, completionRate: rate };
  }, [data]);

  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    if (timeFrame === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (timeFrame === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (timeFrame === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (timeFrame === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {timeFrame === 'week' ? 'Weekly' : timeFrame === 'month' ? 'Monthly' : 'Yearly'} Task Overview
          </CardTitle>
          <div className="flex space-x-2">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[160px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-4 py-2">
                <SelectValue placeholder="Time Frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 w-[160px] justify-between">
              <Button variant="ghost" size="sm" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-800 dark:text-gray-200">
                {timeFrame === 'week' && `Week ${currentWeek.week}, ${currentWeek.year}`}
                {timeFrame === 'month' && selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                {timeFrame === 'year' && selectedDate.getFullYear()}
              </span>
              <Button variant="ghost" size="sm" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {timeFrame === 'week' && <WeeklyOverviewComponent data={data} />}
        {timeFrame === 'month' && <MonthlyCalendarView data={data} year={selectedDate.getFullYear()} month={selectedDate.getMonth()} />}
        {timeFrame === 'year' && <YearlyOverviewComponent data={data} />}

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-green-800 dark:text-green-200 font-semibold text-sm">Completion Rate</h3>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">{completionRate}%</p>
              </div>
              <CheckCircle className="text-green-500 dark:text-green-400" size={20} />
            </div>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-blue-800 dark:text-blue-200 font-semibold text-sm">Completed</h3>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{totalCompleted}</p>
              </div>
              <CheckCircle className="text-blue-500 dark:text-blue-400" size={20} />
            </div>
          </div>
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-semibold text-sm">Missed</h3>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">{totalMissed}</p>
              </div>
              <AlertTriangle className="text-red-500 dark:text-red-400" size={20} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AIInsightsComponent = () => { 
  return (
    <Card className="mb-6 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200">AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-start space-x-2 text-gray-800 dark:text-gray-200">
            <Calendar className="text-purple-400 mt-1 flex-shrink-0" />
            <span>You're most productive on Tuesdays. Consider scheduling important tasks for this day.</span>
          </li>
          <li className="flex items-start space-x-2 text-gray-800 dark:text-gray-200">
            <AlertTriangle className="text-yellow-400 mt-1 flex-shrink-0" />
            <span>You often miss tasks scheduled after 4 PM. Try rescheduling these to earlier in the day.</span>
          </li>
          <li className="flex items-start space-x-2 text-gray-800 dark:text-gray-200">
            <CheckCircle className="text-green-400 mt-1 flex-shrink-0" />
            <span>Great job on completing all your high-priority tasks this week!</span>
          </li>
          <li className="flex items-start space-x-2 text-gray-800 dark:text-gray-200">
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
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-800 dark:text-gray-200">Recent Check-ins</CardTitle>
          <button
            onClick={() => setShowLog(!showLog)}
            className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-md"
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
              <li key={event.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{event.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(event.date).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEventStatus(event.id, 'completed')}
                    className="p-1 text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                    title="Mark as completed"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button 
                    onClick={() => handleEventStatus(event.id, 'missed')}
                    className="p-1 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
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
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Activity Log</h3>
            <ul className="space-y-2">
              {activityLog.map((log, index) => (
                <li key={index} className="text-sm flex items-start space-x-2">
                  <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{log.timestamp}</span>
                  <span className="text-blue-600 dark:text-blue-400">{log.user}</span>
                  <span className="text-gray-800 dark:text-gray-200">{log.action}</span>
                  <span className="text-gray-600 dark:text-gray-400">"{log.details}"</span>
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <DashboardHeader />
        <div className="grid grid-cols-1 gap-6">
          <TaskOverviewComponent />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AIInsightsComponent />
            <RecentCheckIns />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;