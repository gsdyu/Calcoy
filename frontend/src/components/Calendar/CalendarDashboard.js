'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckSquare, AlertTriangle, Activity } from 'lucide-react';

const CalendarDashboard = ({ events = [], checkIns = [], aiRecommendations = [] }) => {
  const [activityData, setActivityData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    // Fetch later from an API (example for now test)
    setActivityData([
      { name: 'Mon', events: 4 },
      { name: 'Tue', events: 3 },
      { name: 'Wed', events: 2 },
      { name: 'Thu', events: 5 },
      { name: 'Fri', events: 4 },
      { name: 'Sat', events: 3 },
      { name: 'Sun', events: 1 },
    ]);

    // Generate sample heatmap data 
    const currentDate = new Date();
    const heatmapData = [];
    for (let i = 0; i < 35; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      heatmapData.unshift({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5),
      });
    }
    setHeatmapData(heatmapData);
  }, []);

  const upcomingEvents = events.slice(0, 3); // Show only the next 3 events

  const getHeatmapColor = (count) => {
    const colors = ['#f3f4f6', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'];
    return colors[Math.min(count, colors.length - 1)];
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <Calendar className="mr-2" size={20} />
            Upcoming Events
          </h2>
          <div>
            {upcomingEvents.map((event, index) => (
              <div key={index} className="mb-2">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-gray-500">{event.date}, {event.time}</p>
              </div>
            ))}
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              View All Events
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <AlertTriangle className="mr-2" size={20} />
            AI Recommendations
          </h2>
          <ul className="list-disc list-inside">
            {aiRecommendations.map((rec, index) => (
              <li key={index} className="mb-2">{rec}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <CheckSquare className="mr-2" size={20} />
            Recent Check-ins
          </h2>
          <div>
            {checkIns.map((checkIn, index) => (
              <div key={index} className="mb-2">
                <p className="font-semibold">{checkIn.title}</p>
                <p className="text-sm text-gray-500">{checkIn.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <Activity className="mr-2" size={20} />
          Activity Heatmap
        </h2>
        <div className="grid grid-cols-7 gap-1">
          {heatmapData.map((day, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded"
              style={{ backgroundColor: getHeatmapColor(day.count) }}
              title={`${day.date}: ${day.count} events`}
            />
          ))}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Last 35 days: Lighter color indicates fewer events, darker color indicates more events
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <Clock className="mr-2" size={20} />
          Weekly Activity
        </h2>
        <div className="space-y-2">
          {activityData.map((day, index) => (
            <div key={index} className="flex items-center">
              <span className="w-12 font-semibold">{day.name}:</span>
              <div className="flex-1 bg-blue-100 rounded-full h-4">
                <div 
                  className="bg-blue-500 rounded-full h-4" 
                  style={{width: `${(day.events / 5) * 100}%`}}
                ></div>
              </div>
              <span className="ml-2">{day.events} events</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarDashboard;