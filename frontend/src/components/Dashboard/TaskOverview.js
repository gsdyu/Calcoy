'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

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

export default TaskOverviewComponent;