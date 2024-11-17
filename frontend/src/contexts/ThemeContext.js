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
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : undefined;
    }
    return undefined;
  });

  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'default';
    }
    return 'default';
  });

  useEffect(() => {
    if (darkMode === undefined) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        if (darkMode === undefined) {
          setDarkMode(e.matches);
        }
      };

      handleChange(mediaQuery);
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [darkMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      localStorage.setItem('theme', selectedTheme);
    }
  }, [darkMode, selectedTheme]);

  const toggleDarkMode = (value) => {
    setDarkMode(value);
  };

  const getCurrentTheme = () => {
    const theme = THEMES[selectedTheme] ?? THEMES.default;
    const mode = darkMode ? 'dark' : 'light';
    return {
      ...theme,
      colors: theme.colors[mode]
    };
  };

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
