'use client'

import React from 'react';
import TaskOverviewComponent from './Taskoverview/TaskOverview';
import AIInsightsComponent from './AI';
import RecentCheckIns from './CheckIns';
 

const DashboardHeader = ({ darkMode }) => (
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
      Dashboard
    </h1>
  </div>
);

const Dashboard = () => {
  const { darkMode } = useTheme(); 

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto">
        <DashboardHeader darkMode={darkMode} />
        <div className="grid grid-cols-1 gap-8">
          <TaskOverviewComponent darkMode={darkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              <AIInsightsComponent darkMode={darkMode} />
            </div>
            <div className={`${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              <RecentCheckIns darkMode={darkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;