'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
     const fetchThemePreference = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/theme', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          setDarkMode(data.dark_mode);
        }
      } catch (error) {
        console.error('Error fetching theme preference:', error);
      }
    };

    fetchThemePreference();
  }, []);

  const toggleDarkMode = async () => {
    try {
       setDarkMode((prevDarkMode) => !prevDarkMode);
       await fetch('http://localhost:5000/api/user/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dark_mode: !darkMode }),
      });
    } catch (error) {
      console.error('Error updating theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
