'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import NavBar from './NavBar';
import SearchBar from './SearchBar';
import Profile from './Profile';
import CustomizationPage from './CustomizationPage';

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSection, setCurrentSection] = useState('Profile');
  const { selectedTheme, presetThemes, colors } = useTheme();

  // Get current theme's gradient or fall back to color-based background
  const getBackgroundStyles = () => {
    if (selectedTheme && presetThemes[selectedTheme]) {
      return presetThemes[selectedTheme].gradient;
    }
    return colors.background;
  };

  const renderSection = () => {
    switch(currentSection) {
      case 'Profile':
        return <Profile />;
      case 'Customization':
        return <CustomizationPage />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className={`flex h-screen ${getBackgroundStyles()}`}>
      {/* Sidebar - Fixed */}
      <div className={`
        w-64 fixed left-0 top-0 h-full overflow-y-auto
        ${colors.buttonBg} shadow-md
        border-r ${colors.buttonBorder}
      `}>
        <div className={`
          p-4 border-b ${colors.buttonBorder}
        `}>
          <h2 className={`text-lg font-bold ${colors.text}`}>
            Settings
          </h2>
        </div>
        <div className="p-4">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setCurrentSection={setCurrentSection}
          />
        </div>
        <NavBar 
          currentSection={currentSection} 
          setCurrentSection={setCurrentSection} 
        />
      </div>

      {/* Main content - Scrollable */}
      <div className={`
        flex-1 ml-64 overflow-y-auto
        ${colors.text}
      `}>
        <div className="p-8 min-h-screen">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default Settings;