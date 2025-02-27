'use client'

import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from 'lucide-react';

const MAX_VISIBLE_TASKS = 3;

const WeeklyOverviewComponent = ({ data, tasks, onUpdateData, darkMode }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const today = new Date();

  const isCurrentWeek = () => {
    if (!data || data.length === 0) return false;
    
    const currentDate = new Date();
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); 
    
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); 
    
    const dataWeek = data[0].weekNumber;
    const dataYear = data[0].year;
    
    const currentWeek = {
      week: Math.ceil((currentDate - new Date(currentDate.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)),
      year: currentDate.getFullYear()
    };
    
    return currentWeek.week === dataWeek && currentWeek.year === dataYear;
  };

  const isToday = (dayName) => {
    if (!isCurrentWeek()) return false;
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdays[today.getDay()] === dayName;
  };

  // Helper function to find tasks for a specific day
  const getTasksForDay = (dayData, category) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.start_time);
      const dayDate = new Date(dayData.date);
      return (
        taskDate.getDate() === dayDate.getDate() &&
        taskDate.getMonth() === dayDate.getMonth() &&
        taskDate.getFullYear() === dayDate.getFullYear() &&
        ((category === 'completed' && task.completed) ||
         (category === 'missed' && !task.completed && taskDate < today) ||
         (category === 'upcoming' && !task.completed && taskDate >= today))
      );
    });
  };

  const onDragStart = (e, dayIndex, fromCategory, task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ 
      dayIndex, 
      fromCategory, 
      taskId: task.id 
    }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (e, toDayIndex, toCategory) => {
    e.preventDefault();
    const { dayIndex: fromDayIndex, fromCategory, taskId } = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (fromDayIndex === toDayIndex && fromCategory !== toCategory) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Create new data with updated counts
      const newData = [...data];
      newData[toDayIndex] = {
        ...newData[toDayIndex],
        [fromCategory]: newData[toDayIndex][fromCategory] - 1,
        [toCategory]: newData[toDayIndex][toCategory] + 1
      };

      // Call onUpdateData with both the new counts and the task to update
      await onUpdateData(newData, task, {
        completed: toCategory === 'completed',
        status: toCategory  
      });
    }
};

  const toggleCategory = (dayIndex, category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [`${dayIndex}-${category}`]: !prev[`${dayIndex}-${category}`]
    }));
  };

  const getCategoryStyles = (category) => {
    switch(category) {
      case 'completed':
        return {
          mainBg: darkMode ? 'bg-green-900/20' : 'bg-green-100/50',
          taskBg: darkMode ? 'bg-green-900/50' : 'bg-green-100',
          hoverBg: 'hover:bg-green-500/20',
          text: `text-green-${darkMode ? '200' : '800'}`,
          border: darkMode ? 'border-green-500/20' : 'border-green-200',
          icon: 'text-green-500',
          iconBg: 'bg-green-500/20'
        };
      case 'missed':
        return {
          mainBg: darkMode ? 'bg-red-900/20' : 'bg-red-100/50',
          taskBg: darkMode ? 'bg-red-900/50' : 'bg-red-100',
          hoverBg: 'hover:bg-red-500/20',
          text: `text-red-${darkMode ? '200' : '800'}`,
          border: darkMode ? 'border-red-500/20' : 'border-red-200',
          icon: 'text-red-500',
          iconBg: 'bg-red-500/20'
        };
      case 'upcoming':
      default:
        return {
          mainBg: darkMode ? 'bg-blue-900/20' : 'bg-blue-100/50',
          taskBg: darkMode ? 'bg-blue-900/50' : 'bg-blue-100',
          hoverBg: 'hover:bg-blue-500/20',
          text: `text-blue-${darkMode ? '200' : '800'}`,
          border: darkMode ? 'border-blue-500/20' : 'border-blue-200',
          icon: 'text-blue-500',
          iconBg: 'bg-blue-500/20'
        };
    }
  };

  const renderTaskList = (dayData, dayIndex, category) => {
    const isExpanded = expandedCategories[`${dayIndex}-${category}`];
    const dayTasks = getTasksForDay(dayData, category);
    const tasksToShow = isExpanded ? dayTasks.length : Math.min(dayTasks.length, MAX_VISIBLE_TASKS);
    const IconComponent = category === 'completed' ? CheckCircle : category === 'missed' ? XCircle : Clock;
    const styles = getCategoryStyles(category);

    return (
      <div className={`p-4 rounded-3xl transition-all duration-200 border ${styles.mainBg} ${styles.border}`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, dayIndex, category)}
      >
        <div className="flex items-center justify-between mb-3">
          <h5 className={`font-medium text-sm ${styles.text}`}>
            {category.charAt(0).toUpperCase() + category.slice(1)} ({dayTasks.length})
          </h5>
          <div className={`p-1.5 rounded-full ${styles.iconBg}`}>
            <IconComponent className={styles.icon} size={14} />
          </div>
        </div>
        <div className="space-y-2">
          {dayTasks.slice(0, tasksToShow).map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => onDragStart(e, dayIndex, category, task)}
              className={`p-3 rounded-2xl text-sm ${styles.taskBg} ${styles.hoverBg}
                cursor-move transition-colors duration-200 ${styles.text}`}
            >
              {task.title}
            </div>
          ))}
        </div>
        {dayTasks.length > MAX_VISIBLE_TASKS && (
          <button 
            onClick={() => toggleCategory(dayIndex, category)}
            className={`mt-3 text-xs font-medium flex items-center justify-center w-full 
              p-2 rounded-2xl transition-colors duration-200 ${styles.text} ${styles.hoverBg}`}
          >
            {isExpanded ? (
              <>Show Less <ChevronUp size={14} className="ml-1" /></>
            ) : (
              <>Show More ({dayTasks.length - MAX_VISIBLE_TASKS}) <ChevronDown size={14} className="ml-1" /></>
            )}
          </button>
        )}
      </div>
    );
  };

  const renderTooltipContent = (dayData, dayIndex) => {
    const totalEvents = dayData.completed + dayData.missed + dayData.upcoming;

    return (
      <div className={`p-3 max-w-xs ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-xl max-h-[400px] overflow-y-auto`}>
        <h4 className={`font-bold mb-4 text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {dayData.name} - Total Events: {totalEvents}
        </h4>
        <div className="space-y-3">
          {renderTaskList(dayData, dayIndex, 'completed')}
          {renderTaskList(dayData, dayIndex, 'missed')}
          {renderTaskList(dayData, dayIndex, 'upcoming')}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-7 gap-4">
        {data.map((dayData, index) => (
          <Tooltip key={dayData.name}>
            <TooltipTrigger asChild>
              <div className={`p-4 rounded-3xl transition-all duration-200 relative
                ${darkMode ? 'bg-gray-900/90 hover:bg-gray-900' : 'bg-gray-50 hover:bg-gray-100'}
                border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
                ${isToday(dayData.name) ? `ring-2 ${darkMode ? 'ring-blue-500' : 'ring-blue-400'}` : ''}
                cursor-pointer group`}
              >
                {isToday(dayData.name) && (
                  <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 
                    rounded-full text-xs font-medium
                    ${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}`}>
                    Today
                  </div>
                )}
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                  {dayData.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <div className="p-1.5 rounded-full bg-green-500/20 
                      group-hover:scale-110 transition-transform duration-200">
                      <CheckCircle size={14} />
                    </div>
                    <span>{dayData.completed}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-400">
                    <div className="p-1.5 rounded-full bg-red-500/20
                      group-hover:scale-110 transition-transform duration-200">
                      <XCircle size={14} />
                    </div>
                    <span>{dayData.missed}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="p-1.5 rounded-full bg-blue-500/20
                      group-hover:scale-110 transition-transform duration-200">
                      <Clock size={14} />
                    </div>
                    <span>{dayData.upcoming}</span>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              align="center" 
              className="p-0 w-auto border-0 bg-transparent"
              sideOffset={5}
            >
              {renderTooltipContent(dayData, index)}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default WeeklyOverviewComponent;