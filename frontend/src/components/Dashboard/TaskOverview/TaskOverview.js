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
import { transformTaskData, getWeekNumber } from './dateutils';
import { useTheme } from '@/contexts/ThemeContext'; 

const TaskOverviewComponent = ({ events, onUpdateTask, setView }) => {
  const [timeFrame, setTimeFrame] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState({ week: 0, year: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const { darkMode } = useTheme(); 

  const tasks = useMemo(() => {
    return events?.filter(event => event.calendar === 'Task') || [];
  }, [events]);

  useEffect(() => {
    const { week, year } = getWeekNumber(selectedDate);
    setCurrentWeek({ week, year });
  }, [selectedDate]);

  useEffect(() => {
    setWeeklyData(transformTaskData(tasks, 'week', selectedDate));
    setMonthlyData(transformTaskData(tasks, 'month', selectedDate));
    setYearlyData(transformTaskData(tasks, 'year', selectedDate));
  }, [tasks, selectedDate]);

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

  const handleTimeFrameUpdate = async (timeFrame) => {
    setTimeFrame(timeFrame);
    setView(timeFrame);
  }

  const handleWeeklyDataUpdate = async (newData, fromTask, updates) => {
    setWeeklyData(newData);
    
    if (fromTask && onUpdateTask) {
      try {
        const success = await onUpdateTask(fromTask.id, {
          completed: updates.completed,
          missed: updates.status === 'missed',
          status: updates.status
        });
        
        if (!success) {
          setWeeklyData(transformTaskData(tasks, 'week', selectedDate));
        }
      } catch (error) {
        console.error('Failed to update task:', error);
        setWeeklyData(transformTaskData(tasks, 'week', selectedDate));
      }
    }
  };

  const handleMonthlyDataUpdate = async (newData, fromTask, toCategory) => {
    setMonthlyData(newData);
    
    if (fromTask && onUpdateTask) {
      try {
        const success = await onUpdateTask(fromTask.id, {
          completed: toCategory === 'completed',
          missed: toCategory === 'missed',
          category: toCategory
        });
        
        if (!success) {
          setMonthlyData(transformTaskData(tasks, 'month', selectedDate));
        }
      } catch (error) {
        console.error('Failed to update task:', error);
        setMonthlyData(transformTaskData(tasks, 'month', selectedDate));
      }
    }
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

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <Card className={`h-full rounded-xl shadow-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white'} 
      border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <CardHeader className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'} flex items-center gap-2`}>
            <span>📊</span>
            {timeFrame === 'week' ? 'Weekly' : timeFrame === 'month' ? 'Monthly' : 'Yearly'} Task Overview
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={timeFrame} onValueChange={handleTimeFrameUpdate}>
              <SelectTrigger className={`w-[180px] h-[45px] ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} 
                rounded-xl transition-colors duration-200`}>
                <SelectValue placeholder="Time Frame" />
              </SelectTrigger>
              <SelectContent className={`${darkMode ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-200'} rounded-xl`}>
                <SelectItem value="week" className={`${darkMode ? 'text-gray-200' : ''} hover:bg-blue-500/20 hover:text-blue-500`}>Weekly</SelectItem>
                <SelectItem value="month" className={`${darkMode ? 'text-gray-200' : ''} hover:bg-blue-500/20 hover:text-blue-500`}>Monthly</SelectItem>
                <SelectItem value="year" className={`${darkMode ? 'text-gray-200' : ''} hover:bg-blue-500/20 hover:text-blue-500`}>Yearly</SelectItem>
              </SelectContent>
            </Select>
            
            <div className={`flex items-center justify-between gap-2 px-4 py-2 h-[45px] rounded-xl 
              ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePrev}
                className={`rounded-full hover:${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} flex-grow text-center`}>
                {timeFrame === 'week' && `Week ${currentWeek.week}, ${currentWeek.year}`}
                {timeFrame === 'month' && selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                {timeFrame === 'year' && selectedDate.getFullYear()}
              </span>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNext}
                className={`rounded-full hover:${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleToday}
              className={`h-[45px] w-[45px] rounded-xl ${
                darkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 
                'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm font-medium">
                Today
              </span>
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`h-[45px] w-[45px] rounded-xl ${darkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 
                    'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className={`w-auto p-0 ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-200'}`}
              >
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} 
                    rounded-xl shadow-lg p-3`}
                  classNames={{
                    day_selected: "bg-blue-500 text-white hover:bg-blue-500",
                    day: darkMode ? "text-gray-200 hover:bg-gray-800" : "text-gray-800 hover:bg-gray-100",
                    day_today: "bg-blue-500/20 text-blue-500",
                    day_outside: darkMode ? "text-gray-500" : "text-gray-400",
                    head_cell: darkMode ? "text-gray-400" : "text-gray-500",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'} 
          border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {timeFrame === 'week' && (
            <WeeklyOverviewComponent 
              data={weeklyData} 
              tasks={tasks}
              onUpdateData={handleWeeklyDataUpdate} 
              darkMode={darkMode} 
            />
          )}
          {timeFrame === 'month' && (
            <MonthlyCalendarView 
              data={monthlyData} 
              tasks={tasks}
              year={selectedDate.getFullYear()} 
              month={selectedDate.getMonth()} 
              onUpdateData={handleMonthlyDataUpdate} 
              darkMode={darkMode} 
            />
          )}
          {timeFrame === 'year' && (
            <YearlyOverviewComponent 
              data={yearlyData} 
              onUpdateData={handleYearlyDataUpdate} 
              darkMode={darkMode} 
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className={`p-4 rounded-xl transition-all duration-200 border
            bg-gradient-to-r ${darkMode ? 
              'from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-500/20' : 
              'from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`${darkMode ? 'text-green-200' : 'text-green-800'} font-semibold text-sm`}>
                  Completion Rate
                </h3>
                <p className={`text-2xl font-bold ${darkMode ? 'text-green-200' : 'text-green-800'}`}>
                  {completionRate}%
                </p>
              </div>
              <div className={`p-2 rounded-full shrink-0
                ${darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-100 border-green-200'} border`}>
                <CheckCircle className="text-green-400" size={20} />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl transition-all duration-200 border
            bg-gradient-to-r ${darkMode ? 
              'from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-500/20' : 
              'from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`${darkMode ? 'text-blue-200' : 'text-blue-800'} font-semibold text-sm`}>
                  Completed
                </h3>
                <p className={`text-2xl font-bold ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  {totalCompleted}
                </p>
              </div>
              <div className={`p-2 rounded-full shrink-0
                ${darkMode ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-100 border-blue-200'} border`}>
                <CheckCircle className="text-blue-400" size={20} />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl transition-all duration-200 border
            bg-gradient-to-r ${darkMode ? 
              'from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 border-red-500/20' : 
              'from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-red-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`${darkMode ? 'text-red-200' : 'text-red-800'} font-semibold text-sm`}>
                  Missed
                </h3>
                <p className={`text-2xl font-bold ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                  {totalMissed}
                </p>
              </div>
              <div className={`p-2 rounded-full shrink-0
                ${darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-100 border-red-200'} border`}>
                <AlertTriangle className="text-red-400" size={20} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskOverviewComponent;
