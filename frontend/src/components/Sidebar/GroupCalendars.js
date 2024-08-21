'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Plus, User, Settings, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Toggle from '@/components/common/Toggle';

const DefaultProfileIcon = () => (
  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const GroupCalendars = ({ onProfileOpen, displayName, profileImage, toggleSidebar, isSidebarOpen }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const groupCalendars = [
    { id: 1, name: "Team Events", icon: "👥" },
    { id: 2, name: "Family Calendar", icon: "👪" },
    { id: 3, name: "Project Deadlines", icon: "🏁" }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target) &&
          profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`w-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} flex flex-col items-center py-4 h-screen relative z-20`}>
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
      <div className="relative mt-auto">
        <button 
          ref={profileButtonRef}
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
          className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden"
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <DefaultProfileIcon />
          )}
        </button>
        {isProfileMenuOpen && (
          <div 
            ref={profileMenuRef}
            className={`fixed bottom-16 left-16 w-60 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg py-1 z-50`}
          >
            <button 
              className={`w-full text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
              onClick={() => {
                onProfileOpen();
                setIsProfileMenuOpen(false);
              }}
            >
              <User size={18} className="inline mr-2" /> Profile
            </button>
            <button className={`w-full text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'}`}>
              <Settings size={18} className="inline mr-2" /> Settings
            </button>
            <button className={`w-full text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'}`}>
              Subscription
            </button>
            <div className={`flex items-center justify-between px-4 py-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Dark Theme
              <Toggle isOn={darkMode} onToggle={toggleDarkMode} />
            </div>
            <button className={`w-full text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}>
              <LogOut size={18} className="inline mr-2" /> Log Out
            </button>
          </div>
        )}
      </div>
      <button 
        onClick={toggleSidebar}
        className={`absolute -right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md transition-all duration-300`}
      >
        {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </div>
  );
};

export default GroupCalendars;