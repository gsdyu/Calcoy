'use client';

import React from 'react';
import { Calendar, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const GroupCalendars = ({ toggleSidebar, isSidebarOpen }) => {
  const { darkMode } = useTheme();
  const groupCalendars = [
    { id: 1, name: "Team Events", icon: "👥" },
    { id: 2, name: "Family Calendar", icon: "👪" },
    { id: 3, name: "Project Deadlines", icon: "🏁" }
  ];

  return (
    <div className={`w-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} flex flex-col items-center py-4 h-screen relative z-40`}>
      <button 
        onClick={toggleSidebar}
        className={`absolute -left-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md transition-all duration-300`}
      >
        {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
      <div className="flex-grow flex flex-col items-center space-y-4">
        <button className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
          <Calendar size={24} />
        </button>
        <div className="w-8 h-0.5 bg-gray-600 my-2"></div>
        {groupCalendars.map(calendar => (
          <button key={calendar.id} className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center`}>
            {calendar.icon}
          </button>
        ))}
        <button className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center mt-auto`}>
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default GroupCalendars;