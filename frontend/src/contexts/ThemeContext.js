'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const THEMES = {
  default: {
    name: 'Default',
    gradient: 'bg-gradient-to-b from-yellow-100 via-purple-100 to-blue-200',
    colors: {
      light: {
        background: 'bg-white',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        buttonBg: 'bg-white hover:bg-gray-50',
        buttonBorder: 'border-gray-200',
        selectedBg: 'bg-blue-50',
        selectedBorder: 'border-blue-200'
      },
      dark: {
        background: 'bg-[#0B0F17]',
        text: 'text-gray-300',
        textSecondary: 'text-gray-400',
        buttonBg: 'bg-gray-900/40 hover:bg-gray-800/40',
        buttonBorder: 'border-gray-800',
        selectedBg: 'bg-blue-900/25',
        selectedBorder: 'border-blue-800/50'
      }
    }
  },
  skyWaves: {
    name: 'Sky Waves',
    gradient: 'bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600',
    colors: {
      light: {
        background: 'bg-white',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        buttonBg: 'bg-white hover:bg-sky-50',
        buttonBorder: 'border-gray-200',
        selectedBg: 'bg-sky-50',
        selectedBorder: 'border-sky-200'
      },
      dark: {
        background: 'bg-[#0B0F17]',
        text: 'text-gray-300',
        textSecondary: 'text-gray-400',
        buttonBg: 'bg-gray-900/40 hover:bg-gray-800/40',
        buttonBorder: 'border-gray-800',
        selectedBg: 'bg-sky-900/25',
        selectedBorder: 'border-sky-800/50'
      }
    }
  },
  bluePurple: {
    name: 'Blue Purple',
    gradient: 'bg-gradient-to-b from-blue-400 via-blue-500 to-purple-600',
    colors: {
      light: {
        background: 'bg-white',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        buttonBg: 'bg-white hover:bg-purple-50',
        buttonBorder: 'border-gray-200',
        selectedBg: 'bg-purple-50',
        selectedBorder: 'border-purple-200'
      },
      dark: {
        background: 'bg-[#0B0F17]',
        text: 'text-gray-300',
        textSecondary: 'text-gray-400',
        buttonBg: 'bg-gray-900/40 hover:bg-gray-800/40',
        buttonBorder: 'border-gray-800',
        selectedBg: 'bg-purple-900/25',
        selectedBorder: 'border-purple-800/50'
      }
    }
  },
  northernLights: {
    name: 'Northern Lights',
    gradient: 'bg-gradient-to-b from-blue-400 via-purple-300 to-green-200',
    colors: {
      light: {
        background: 'bg-white',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        buttonBg: 'bg-white hover:bg-green-50',
        buttonBorder: 'border-gray-200',
        selectedBg: 'bg-green-50',
        selectedBorder: 'border-green-200'
      },
      dark: {
        background: 'bg-[#0B0F17]',
        text: 'text-gray-300',
        textSecondary: 'text-gray-400',
        buttonBg: 'bg-gray-900/40 hover:bg-gray-800/40',
        buttonBorder: 'border-gray-800',
        selectedBg: 'bg-green-900/25',
        selectedBorder: 'border-green-800/50'
      }
    }
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize darkMode with null to prevent flash of wrong theme
  const [darkMode, setDarkMode] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('default');

  // Handle initial theme setup and backend sync
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // First try to get user preferences from backend
        const response = await fetch('http://localhost:5000/profile', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.dark_mode !== undefined) {
            setDarkMode(data.preferences.dark_mode);
            localStorage.setItem('darkMode', JSON.stringify(data.dark_mode));
            return;
          }
        }

        // If backend request fails or no preference, fall back to local storage
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
          setDarkMode(JSON.parse(savedDarkMode));
        } else {
          // If no saved preference, check system preference
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          setDarkMode(mediaQuery.matches);
        }
      } catch (error) {
        console.error('Error fetching theme preferences:', error);
        // Fallback to system preference if everything fails
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setDarkMode(mediaQuery.matches);
      }
    };

    initializeTheme();
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    if (darkMode !== null) {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      
      // Sync with backend
      fetch('http://localhost:5000/profile/preferencesasdf', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dark_mode: darkMode
        })
      }).catch(error => {
        console.error('Error saving theme preference to backend:', error);
      });
    }
  }, [darkMode]);

  const toggleDarkMode = async (value) => {
    if (value === undefined) {
      // Remove saved preference and use system
      localStorage.removeItem('darkMode');
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(mediaQuery.matches);
    } else {
      setDarkMode(value);
    }
  };

  const getCurrentTheme = () => {
    const theme = THEMES[selectedTheme] ?? THEMES.default;
    const mode = darkMode ? 'dark' : 'light';
    return {
      ...theme,
      colors: theme.colors[mode]
    };
  };

  // Don't render until we've determined the theme
  if (darkMode === null) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode,
      selectedTheme,
      setSelectedTheme,
      currentTheme: getCurrentTheme(),
      themes: THEMES
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
