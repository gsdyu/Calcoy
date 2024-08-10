import React, { useState } from 'react';
import { User, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import PersonalCalendar from './PersonalCalendar';
import CheckIns from './CheckIns';
import Tasks from './Tasks';
import Toggle from '../common/Toggle';

const Sidebar = ({ onProfileOpen, displayName, profileImage, isCollapsed, toggleSidebar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-60'} ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex flex-col relative transition-all duration-300`}>
      <div className="flex-grow overflow-hidden">
        {!isCollapsed && (
          <>
            <PersonalCalendar />
            <CheckIns />
            <Tasks />
          </>
        )}
      </div>
      <button 
        onClick={toggleSidebar}
        className={`absolute -right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full p-1`}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
      <div className={`p-4 ${darkMode ? 'border-t border-gray-600' : 'border-t border-gray-300'} mt-auto relative`}>
        <button 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
          className={`flex items-center space-x-2 w-full ${isCollapsed ? 'justify-center' : ''}`}
        >
          <img
            src={profileImage}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
          {!isCollapsed && <span>{displayName}</span>}
        </button>
        {isProfileMenuOpen && (
          <div className={`absolute bottom-full left-0 mb-2 ${isCollapsed ? 'w-60 -left-44' : 'w-full'} bg-gray-800 rounded-md shadow-lg py-1`}>
            <button 
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
              onClick={() => {
                onProfileOpen();
                setIsProfileMenuOpen(false);
              }}
            >
              <User size={18} className="inline mr-2" /> Profile
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-700">
              <Settings size={18} className="inline mr-2" /> Settings
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-700">
              Subscription
            </button>
            <div className="flex items-center justify-between px-4 py-2">
              Dark Theme
              <Toggle isOn={darkMode} onToggle={toggleDarkMode} />
            </div>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400">
              <LogOut size={18} className="inline mr-2" /> Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;