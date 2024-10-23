'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const Googleapi = () => {
  const { darkMode } = useTheme();

  const handleGoogleCalendarAuth = async () => {
    try {
      // This would trigger your OAuth flow for Google Calendar
      window.location.href = 'http://localhost:5000/auth/google';
    } catch (error) {
      console.error('Error authenticating with Google Calendar:', error);
    }
  };

  return (
    <div className={`p-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
      <button
        onClick={handleGoogleCalendarAuth}
        className={`flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-500 p-2 rounded transition-all duration-200 ${
             'opacity-50'
          }`}       >
        + Add calendar account
      </button>
    </div>
  );
};

export default Googleapi;
