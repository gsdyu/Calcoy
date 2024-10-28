'use client';

import React, { useState } from 'react';
import { Calendar, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import CreateCalendarModal from '@/components/Modals/createCalendarModal';

const GroupCalendars = ({ toggleSidebar, isSidebarOpen, activeCalendar, handleChangeActiveCalendar}) => {
  const { darkMode } = useTheme();
  const [isCreateCalendarOpen, setIsCreateCalendarOpen] = useState(false);
  
  const groupCalendars = [

  ];

  const handleOpenCalendar = () => {
    setIsCreateCalendarOpen(true);
  };


  const handleCloseCreateCalendarModal = () => {
    setIsCreateCalendarOpen(false);
  };

  return (
    <div className={`w-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} flex flex-col items-center py-4 h-screen relative z-40`}>
      <button 
        onClick={toggleSidebar}
        className={`absolute -left-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md transition-all duration-300`}
      >
        {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="flex-grow flex flex-col items-center space-y-4">
        {/* Main Calendar Button */}
        <button 
          className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center" 
          onClick={() => handleChangeActiveCalendar(null)}
        >
          <Calendar size={24} className="text-white" />
        </button>
        
        {/* Shared Calendar Button */}
        <button 
          onClick={() => handleChangeActiveCalendar(0)} // Set active view for Shared Calendar
          className={`w-12 h-12 rounded-full bg-green-600 flex items-center justify-center ${activeCalendar === 0 ? 'border-2 border-blue-500' : ''}`}
        >
          <Calendar size={24} className="text-white" />
        </button>

        <div className="w-8 h-0.5 bg-gray-600 my-2"></div>
        
        {/* Group Calendar Buttons */}
        {groupCalendars.map(calendar => (
          <button 
            key={calendar.id} 
            onClick={() => handleChangeActiveCalendar(calendar.id)} // Set the active calendar on click
            className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center ${activeCalendar === calendar.id ? 'border-2 border-blue-500' : ''}`}
          >
            {calendar.icon}
          </button>
        ))}

        {/* Add New Calendar Button */}
        <button 
          className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center mt-auto`} 
          onClick={handleOpenCalendar}
        >
          <Plus size={24} />
        </button>
      </div>

      {isCreateCalendarOpen && (
        <CreateCalendarModal onClose={handleCloseCreateCalendarModal} />
      )}

      {/* Main Content Area */}
    </div>
  );
};

export default GroupCalendars;
