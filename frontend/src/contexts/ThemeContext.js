'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const PRESET_THEMES = {
  'soft-pink': {
    name: 'Soft Pink',
    gradient: 'bg-gradient-to-r from-pink-200 via-pink-100 to-white',
    isDark: false
  },
  'morning-sunrise': {
    name: 'Morning Sunrise',
    gradient: 'bg-gradient-to-b from-yellow-100 via-purple-100 to-blue-200',
    isDark: false
  },
  'sky-waves': {
    name: 'Sky Waves',
    gradient: 'bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600',
    isDark: true
  },
  'blue-purple': {
    name: 'Blue Purple',
    gradient: 'bg-gradient-to-b from-blue-400 via-blue-500 to-purple-600',
    isDark: true
  },
  'northern-lights': {
    name: 'Northern Lights',
    gradient: 'bg-gradient-to-b from-blue-400 via-purple-300 to-green-200',
    isDark: false
  }
};

const BASE_COLORS = {
  light: {
    background: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    buttonBg: 'bg-white hover:bg-gray-50',
    buttonBorder: 'border-gray-200',
    selectedBg: 'bg-gray-50',
    selectedBorder: 'border-gray-200'
  },
  dark: {
    background: 'bg-[#0B0F17]',
    text: 'text-gray-300',
    textSecondary: 'text-gray-400',
    buttonBg: 'bg-gray-900/40 hover:bg-gray-800/40',
    buttonBorder: 'border-gray-800',
    selectedBg: 'bg-white/10',
    selectedBorder: 'border-white/20'
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Check localStorage first
        const savedTheme = localStorage.getItem('selectedTheme');
        const savedDarkMode = localStorage.getItem('darkMode');

        if (savedTheme) {
          setSelectedTheme(savedTheme);
          // Theme's dark mode takes precedence if a theme is selected
          setDarkMode(PRESET_THEMES[savedTheme]?.isDark ?? false);
          return;
        }

        if (savedDarkMode !== null) {
          setDarkMode(savedDarkMode === 'true');
          return;
        }

        // Try to get user preferences from backend
        const response = await fetch('http://localhost:5000/profile', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.preferences?.theme) {
            setSelectedTheme(data.preferences.theme);
            setDarkMode(PRESET_THEMES[data.preferences.theme]?.isDark ?? false);
            return;
          }
          if (data.preferences?.dark_mode !== undefined) {
            setDarkMode(data.preferences.dark_mode);
            return;
          }
        }

        // Fall back to system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setDarkMode(mediaQuery.matches);
      } catch (error) {
        console.error('Error fetching theme preferences:', error);
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setDarkMode(mediaQuery.matches);
      }
    };

    initializeTheme();
  }, []);

  const handleThemeChange = async (themeId) => {
    setSelectedTheme(themeId);
    if (themeId) {
      localStorage.setItem('selectedTheme', themeId);
      localStorage.removeItem('darkMode');
      setDarkMode(PRESET_THEMES[themeId]?.isDark ?? false);
    } else {
      localStorage.removeItem('selectedTheme');
    }

    // Sync with backend
    try {
      await fetch('http://localhost:5000/profile/preferences', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: themeId
        })
      });
    } catch (error) {
      console.error('Error saving theme preference to backend:', error);
    }
  };

  const handleColorModeChange = async (mode) => {
    // Clear any selected theme when changing color mode
    setSelectedTheme(null);
    localStorage.removeItem('selectedTheme');

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(mediaQuery.matches);
      localStorage.removeItem('darkMode');
    } else {
      const isDark = mode === 'dark';
      setDarkMode(isDark);
      localStorage.setItem('darkMode', isDark.toString());
    }

    // Sync with backend
    try {
      await fetch('http://localhost:5000/profile/preferences', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dark_mode: mode === 'dark' ? true : mode === 'light' ? false : null
        })
      });
    } catch (error) {
      console.error('Error saving color mode preference to backend:', error);
    }
  };

  const getCurrentMode = () => {
    if (selectedTheme) return PRESET_THEMES[selectedTheme]?.isDark ? 'dark' : 'light';
    if (darkMode === null) return 'system';
    return darkMode ? 'dark' : 'light';
  };

  const getColors = () => {
    return BASE_COLORS[darkMode ? 'dark' : 'light'];
  };

  // Don't render until we've determined the theme
  if (darkMode === null) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ 
      darkMode,
      selectedTheme,
      currentMode: getCurrentMode(),
      colors: getColors(),
      presetThemes: PRESET_THEMES,
      handleThemeChange,
      handleColorModeChange
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};