import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import PersonalCalendar from './PersonalCalendar';
import CheckIns from './CheckIns';
import Tasks from './Tasks';
import Toggle from '../common/Toggle';
import MiniCalendar from './MiniCalendar';

const DefaultProfileIcon = () => (
  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const Sidebar = ({ onProfileOpen, displayName, profileImage, isCollapsed, toggleSidebar, onDateSelect, currentView, onViewChange }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [lastNonDayView, setLastNonDayView] = useState('Month');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMiniCalendarDateSelect = (date) => {
    const isSameDate = selectedDate && selectedDate.getTime() === date.getTime();

    if (currentView !== 'Day') {
      setLastNonDayView(currentView);
    }

    if (isSameDate) {
      if (currentView === 'Day') {
        onViewChange(lastNonDayView);
      } else {
        onViewChange('Day');
      }
    } else {
      setSelectedDate(date);
      onDateSelect(date);
      if (currentView === 'Day') {
        onViewChange(lastNonDayView);
      }
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-60'} ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex flex-col relative transition-all duration-300`}>
      <div className="flex-grow overflow-hidden">
        {!isCollapsed && (
          <>
            <PersonalCalendar />
            <MiniCalendar 
              onDateSelect={handleMiniCalendarDateSelect} 
              currentView={currentView} 
              onViewChange={onViewChange}
              selectedDate={selectedDate}
            />
            <CheckIns />
            <Tasks />
          </>
        )}
      </div>
      <button 
        onClick={toggleSidebar}
        className={`absolute -right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md`}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
      <div className={`p-4 ${darkMode ? 'border-t border-gray-600' : 'border-t border-gray-300'} mt-auto relative`}>
        <button 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
          className={`flex items-center space-x-2 w-full ${isCollapsed ? 'justify-center' : ''}`}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <DefaultProfileIcon />
          )}
          {!isCollapsed && <span>{displayName}</span>}
        </button>
        {isProfileMenuOpen && (
          <div 
            ref={profileMenuRef}
            className={`absolute bottom-full left-0 mb-2 ${isCollapsed ? 'w-60 -left-44' : 'w-full'} ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg py-1`}
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
    </div>
  );
};

export default Sidebar;