'use client'
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import NavBar from './NavBar';
import SearchBar from './SearchBar';
import Profile from './Profile';
import Customization from './Customization';


const Settings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSection, setCurrentSection] = useState('Profile');
  const { darkMode } = useTheme();

  const renderSection = () => {
    switch(currentSection) {
      case 'Profile':
        return <Profile />;
      case 'Customization':
        return <Customization />;
      // Add other cases later
      default:
        return <Profile />;
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      {/* Sidebar */}
      <div className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">Settings</h2>
        </div>
        <div className="p-4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
        <NavBar currentSection={currentSection} setCurrentSection={setCurrentSection} />
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {renderSection()}
      </div>
    </div>
  );
};

export default Settings;