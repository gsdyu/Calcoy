'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import WeeklyOverviewComponent from './WeeklyOverview';
import MonthlyCalendarView from './MonthlyOverview';
import YearlyOverviewComponent from './YearlyOverview';
import { generateData, getWeekNumber } from './dateutils';
import { useTheme } from '@/contexts/ThemeContext'; 

const TaskOverviewComponent = () => {
  const [timeFrame, setTimeFrame] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState({ week: 0, year: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const { darkMode } = useTheme(); 

  useEffect(() => {
    const { week, year } = getWeekNumber(selectedDate);
    setCurrentWeek({ week, year });
  }, [selectedDate]);

  useEffect(() => {
    setWeeklyData(generateData('week', selectedDate.getFullYear(), selectedDate.getMonth()));
    setMonthlyData(generateData('month', selectedDate.getFullYear(), selectedDate.getMonth()));
    setYearlyData(generateData('year', selectedDate.getFullYear(), selectedDate.getMonth()));
  }, [selectedDate]);

  const data = useMemo(() => {
    switch (timeFrame) {
      case 'week':
        return weeklyData;
      case 'month':
        return monthlyData;
      case 'year':
        return yearlyData;
      default:
        return [];
    }
  }, [timeFrame, weeklyData, monthlyData, yearlyData]);

  const handleWeeklyDataUpdate = (newData) => {
    setWeeklyData(newData);
  };

  const handleMonthlyDataUpdate = (newData) => {
    setMonthlyData(newData);
  };

  const handleYearlyDataUpdate = (newData) => {
    setYearlyData(newData);
  };

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
    <Card className={`w-full max-w-4xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {timeFrame === 'week' ? 'Weekly' : timeFrame === 'month' ? 'Monthly' : 'Yearly'} Task Overview
          </CardTitle>
          <div className="flex space-x-2">
            <div className="h-10">
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className={`w-[100px] ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} rounded-md shadow-sm px-4 py-2`}>
                  <SelectValue placeholder="Time Frame" />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}>
                  <SelectItem value="week" className={`${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}>Weekly</SelectItem>
                  <SelectItem value="month" className={`${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}>Monthly</SelectItem>
                  <SelectItem value="year" className={`${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}>Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className={`h-10 flex items-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} rounded-md shadow-sm px-3 py-2`}>
              <Button variant="ghost" size="sm" onClick={handlePrev} className="h-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} mx-2`}>
                {timeFrame === 'week' && `Week ${currentWeek.week}, ${currentWeek.year}`}
                {timeFrame === 'month' && selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                {timeFrame === 'year' && selectedDate.getFullYear()}
              </span>
              <Button variant="ghost" size="sm" onClick={handleNext} className="h-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-10">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-full">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-md shadow-md p-3`}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {timeFrame === 'week' && <WeeklyOverviewComponent data={weeklyData} onUpdateData={handleWeeklyDataUpdate} darkMode={darkMode} />}
        {timeFrame === 'month' && <MonthlyCalendarView data={monthlyData} year={selectedDate.getFullYear()} month={selectedDate.getMonth()} onUpdateData={handleMonthlyDataUpdate} darkMode={darkMode} />}
        {timeFrame === 'year' && <YearlyOverviewComponent data={yearlyData} onUpdateData={handleYearlyDataUpdate} darkMode={darkMode} />}

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className={`${darkMode ? 'bg-green-900' : 'bg-green-100'} p-3 rounded-lg`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`${darkMode ? 'text-green-200' : 'text-green-800'} font-semibold text-sm`}>Completion Rate</h3>
                <p className={`text-2xl font-bold ${darkMode ? 'text-green-200' : 'text-green-800'}`}>{completionRate}%</p>
              </div>
              <CheckCircle className={darkMode ? 'text-green-400' : 'text-green-500'} size={20} />
            </div>
          </div>
          <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} p-3 rounded-lg`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`${darkMode ? 'text-blue-200' : 'text-blue-800'} font-semibold text-sm`}>Completed</h3>
                <p className={`text-2xl font-bold ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>{totalCompleted}</p>
              </div>
              <CheckCircle className={darkMode ? 'text-blue-400' : 'text-blue-500'} size={20} />
            </div>
          </div>
          <div className={`${darkMode ? 'bg-red-900' : 'bg-red-100'} p-3 rounded-lg`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`${darkMode ? 'text-red-200' : 'text-red-800'} font-semibold text-sm`}>Missed</h3>
                <p className={`text-2xl font-bold ${darkMode ? 'text-red-200' : 'text-red-800'}`}>{totalMissed}</p>
              </div>
              <AlertTriangle className={darkMode ? 'text-red-400' : 'text-red-500'} size={20} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskOverviewComponent;