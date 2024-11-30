'use client'

import React, { useState, useEffect } from 'react';
import TaskOverviewComponent from './Taskoverview/TaskOverview';
import AIInsightsComponent from './AI';
import RecentCheckIns from './CheckIns';
import { useTheme } from '@/contexts/ThemeContext'; 

const DashboardHeader = ({ colors, selectedTheme, presetThemes }) => (
  <div className={`flex justify-between items-center mb-8 ${colors.text}`}>
    <h1 className={`text-3xl font-bold ${
      selectedTheme 
        ? 'text-inherit' 
        : 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'
    }`}>
      Dashboard
    </h1>
  </div>
);

const Dashboard = () => {
  const { 
    darkMode, 
    selectedTheme, 
    colors, 
    presetThemes 
  } = useTheme();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const check = await fetch('http://localhost:5000/auth/check', {
        credentials: 'include',
      });
      if (!check.ok) return;

      const response = await fetch('http://localhost:5000/events', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map(event => {
          const startTime = new Date(event.start_time);
          const endTime = new Date(event.end_time);
          return {
            ...event,
            date: startTime.toLocaleDateString(),
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isTask: event.calendar === 'Task',
            completed: event.completed || false
          };
        });
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleTaskComplete = async (taskId, completed) => {
    try {
      const check = await fetch('http://localhost:5000/auth/check', {
        credentials: 'include',
      });
      if (!check.ok) return;

      const eventToUpdate = events.find(event => event.id === taskId);
      if (!eventToUpdate) return;

      const updatedEvent = {
        ...eventToUpdate,
        completed
      };

      const response = await fetch(`http://localhost:5000/events/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedEvent),
      });

      if (response.ok) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === taskId ? { ...event, completed } : event
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  };

  const handleDragDropUpdate = async (taskId, updates) => {
    try {
      const check = await fetch('http://localhost:5000/auth/check', {
        credentials: 'include',
      });
      if (!check.ok) return false;

      const eventToUpdate = events.find(event => event.id === taskId);
      if (!eventToUpdate) return false;

      const updatedEvent = {
        ...eventToUpdate,
        completed: updates.completed,
        status: updates.status,
        calendar: eventToUpdate.calendar,
        start_time: eventToUpdate.start_time,
        end_time: eventToUpdate.end_time,
        title: eventToUpdate.title,
        description: eventToUpdate.description,
        location: eventToUpdate.location,
      };

      const response = await fetch(`http://localhost:5000/events/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedEvent),
      });

      if (response.ok) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === taskId 
              ? {
                  ...event,
                  completed: updates.completed,
                  status: updates.status
                }
              : event
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating task via drag and drop:', error);
      return false;
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    if (updates.status) {
      return handleDragDropUpdate(taskId, updates);
    }
    else if (updates.hasOwnProperty('completed')) {
      return handleTaskComplete(taskId, updates.completed);
    }
    return false;
  };

  const containerClasses = `min-h-screen p-8 ${
    selectedTheme 
      ? presetThemes[selectedTheme]?.gradient
      : darkMode 
        ? 'bg-gray-900' 
        : 'bg-gray-100'
  }`;

  return (
    <div className={containerClasses}>
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          colors={colors} 
          selectedTheme={selectedTheme}
          presetThemes={presetThemes}
        />
        <div className="grid grid-cols-1 gap-8">
          <TaskOverviewComponent 
            darkMode={darkMode} 
            colors={colors}
            events={events}
            onTaskComplete={handleTaskComplete}
            onUpdateTask={handleUpdateTask} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              <AIInsightsComponent 
                darkMode={darkMode}
                colors={colors} 
              />
            </div>
            <div className={`${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              <RecentCheckIns 
                darkMode={darkMode}
                colors={colors}
                events={events}
                onTaskComplete={handleTaskComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;