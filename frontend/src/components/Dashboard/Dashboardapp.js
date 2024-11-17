'use client'

import React, { useState, useEffect } from 'react';
import TaskOverviewComponent from './TaskOverview/TaskOverview';
import RecentCheckIns from './CheckIns';
import { useTheme } from '@/contexts/ThemeContext'; 

const DashboardHeader = ({ darkMode }) => (
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
      Dashboard
    </h1>
  </div>
);

const Dashboard = () => {
  const { darkMode } = useTheme();
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
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto">
        <DashboardHeader darkMode={darkMode} />
        <div className="grid grid-cols-1 gap-8">
          <TaskOverviewComponent 
            darkMode={darkMode} 
            events={events}
            onTaskComplete={handleTaskComplete}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
             </div>
            <div className={`${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              <RecentCheckIns 
                darkMode={darkMode} 
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
