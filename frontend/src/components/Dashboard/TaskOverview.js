import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const generateWeekData = (startDate) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date,
      completed: Math.floor(Math.random() * 10),
      missed: Math.floor(Math.random() * 5),
      upcoming: Math.floor(Math.random() * 7)
    };
  });
};

const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
};


// Week Specific
const WeeklyOverviewComponent = ({ data }) => {
  return (
    <div className="grid grid-cols-7 gap-4">
      {data.map((dayData) => (
        <div key={dayData.date.toISOString()} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {dayData.date.toLocaleDateString('en-US', { weekday: 'short' })}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {dayData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-green-600">✓ {dayData.completed}</span>
            </p>
            <p className="text-sm">
              <span className="text-red-600">✗ {dayData.missed}</span>
            </p>
            <p className="text-sm">
              <span className="text-blue-600">◷ {dayData.upcoming}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const CustomCalendar = ({ selected, onSelect }) => {
  const [hoveredDate, setHoveredDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(selected));

  const isDateInSelectedWeek = (date) => {
    if (!selected) return false;
    const start = new Date(selected);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return date >= start && date <= end;
  };

  const isDateInHoveredWeek = (date) => {
    if (!hoveredDate) return false;
    const start = new Date(hoveredDate);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return date >= start && date <= end;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <Button variant="outline" size="sm" onClick={handlePrevMonth} className="px-2 py-1">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <Button variant="outline" size="sm" onClick={handleNextMonth} className="px-2 py-1">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <CalendarComponent
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        initialFocus
        modifiers={{
          selected: (date) => isDateInSelectedWeek(date),
          hovered: (date) => isDateInHoveredWeek(date),
        }}
        modifiersStyles={{
          selected: { backgroundColor: '#3b82f6', color: 'white', borderRadius: '0' },
          hovered: { backgroundColor: '#bfdbfe', borderRadius: '0' },
        }}
        onDayMouseEnter={(date) => setHoveredDate(date)}
        onDayMouseLeave={() => setHoveredDate(null)}
        classNames={{
          day_selected: 'rounded-none',
          day_today: 'bg-orange-100 text-orange-600 font-bold',
          caption: 'hidden',
        }}
      />
    </div>
  );
};


const MonthlyCalendarView = ({ data, year, month }) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">{monthNames[month]} {year}</h2>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekdays.map(day => (
            <div key={day} className="text-center font-bold text-gray-600 p-2">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2"></div>
          ))}
          {data.map((day) => (
            <div key={day.day} className="bg-gray-100 p-2 rounded-lg text-center">
              <div className="font-semibold text-gray-800 mb-1">{day.day}</div>
              <div className="flex flex-col items-center space-y-1 text-xs">
                <span className="text-green-600">{day.completed} ✓</span>
                <span className="text-red-600">{day.missed} ✗</span>
                <span className="text-blue-600">{day.upcoming} ◷</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };


  
const TaskOverviewComponent = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState({ week: 0, year: 0 });

  useEffect(() => {
    const { week, year } = getWeekNumber(selectedDate);
    setCurrentWeek({ week, year });
  }, [selectedDate]);

  const data = useMemo(() => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return generateWeekData(weekStart);
  }, [selectedDate]);

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

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date) => {
    const selectedWeekStart = new Date(date);
    selectedWeekStart.setDate(date.getDate() - date.getDay());
    setSelectedDate(selectedWeekStart);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle className="text-2xl font-bold text-gray-800">Weekly Task Overview</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Week {currentWeek.week}, {currentWeek.year}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CustomCalendar
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <WeeklyOverviewComponent data={data} />

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-green-100 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-green-800 font-semibold text-sm">Completion Rate</h3>
                <p className="text-2xl font-bold text-green-800">{completionRate}%</p>
              </div>
              <CheckCircle className="text-green-500" size={20} />
            </div>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-blue-800 font-semibold text-sm">Completed</h3>
                <p className="text-2xl font-bold text-blue-800">{totalCompleted}</p>
              </div>
              <CheckCircle className="text-blue-500" size={20} />
            </div>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-red-800 font-semibold text-sm">Missed</h3>
                <p className="text-2xl font-bold text-red-800">{totalMissed}</p>
              </div>
              <AlertTriangle className="text-red-500" size={20} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskOverviewComponent;