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
  const { selectedTheme, presetThemes, colors, darkMode } = useTheme();

  // Get current theme's gradient or fall back to color-based background
  const getBackgroundStyles = () => {
    if (selectedTheme && presetThemes[selectedTheme]) {
      return presetThemes[selectedTheme].gradient;
    }
    return darkMode ? 'bg-gray-800' : 'bg-white';  
  };

  // Get text color based on theme
  const getTextColor = () => {
    if (selectedTheme && presetThemes[selectedTheme]) {
      return presetThemes[selectedTheme].isDark ? 'text-white' : 'text-gray-900';
    }
    return colors.text;
  };

  // Get border color based on theme
  const getBorderColor = () => {
    if (selectedTheme && presetThemes[selectedTheme]) {
      return presetThemes[selectedTheme].isDark 
        ? 'border-white/20' 
        : 'border-black/10';
    }
    return colors.buttonBorder;
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
          <div
        className={`flex h-screen ${
          darkMode ? 'bg-gray-900' : ''
        } ${getBackgroundStyles()}`}
      >
      {/* Sidebar - */}
      <div className={`
        w-64 fixed left-0 top-0 h-full overflow-y-auto
        ${getBackgroundStyles()}
        shadow-md
        border-r ${getBorderColor()}
        transition-colors duration-200
      `}>
        <div className={`
          p-4 border-b ${getBorderColor()}
        `}>
          <h2 className={`text-lg font-bold ${getTextColor()}`}>
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
        ${getTextColor()}
      `}>
        <div className="p-8 min-h-screen">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default Settings;