'use client'
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import NavBar from './NavBar';
import SearchBars from './SearchBars';
import Profile from './Profile';
import CustomizationPage from './CustomizationPage';

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSection, setCurrentSection] = useState('Profile');
  const { darkMode } = useTheme();

  const renderSection = () => {
    switch(currentSection) {
      case 'Profile':
        return <Profile />;
      case 'Customization':
        return <CustomizationPage />;
      // Add other cases later
      default:
        return <Profile />;
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      {/* Sidebar - Fixed */}
      <div className={`w-64 fixed left-0 top-0 h-full overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">Settings</h2>
        </div>
        <div className="p-4">
          <SearchBars searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
        <NavBar currentSection={currentSection} setCurrentSection={setCurrentSection} />
      </div>

      {/* Main content - Scrollable */}
      <div className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8 min-h-screen">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default Settings;