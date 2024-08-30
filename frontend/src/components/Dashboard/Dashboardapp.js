'use client'

import React from 'react';
import TaskOverviewComponent from './TaskOverview';
import AIInsightsComponent from './AI';
import RecentCheckIns from './CheckIns';

const DashboardHeader = () => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <DashboardHeader />
        <div className="grid grid-cols-1 gap-6">
          <TaskOverviewComponent />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AIInsightsComponent />
            <RecentCheckIns />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;