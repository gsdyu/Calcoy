'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const TitleCalendar = ({ activeCalendar }) => {
  const { darkMode } = useTheme();

  return (
    <div className={`p-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {activeCalendar && activeCalendar.name ? (
        <h1 className="text-2xl font-semibold mb-2">{activeCalendar.name}</h1>
      ) : (
        <h2 className="text-xl font-bold mb-4">Main Calendar View</h2>
      )}
    </div>
  );
};

export default TitleCalendar;
