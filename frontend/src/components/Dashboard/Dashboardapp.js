'use client'

import React from 'react';
import TaskOverviewComponent from './Taskoverview/TaskOverview';
import AIInsightsComponent from './AI';
import RecentCheckIns from './CheckIns';
import { useTheme } from '@/contexts/ThemeContext'; 

const DashboardHeader = ({ darkMode }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dashboard</h1>
  </div>
);

const Dashboard = () => {
  const { darkMode } = useTheme(); 

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      <div className="max-w-6xl mx-auto">
        <DashboardHeader darkMode={darkMode} />
        <div className="grid grid-cols-1 gap-6">
          <TaskOverviewComponent darkMode={darkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AIInsightsComponent darkMode={darkMode} />
            <RecentCheckIns darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;