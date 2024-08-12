import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PersonalCalendar = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`p-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h2 className="text-xl font-bold mb-4">Personal Calendar</h2>
    </div>
  );
};

export default PersonalCalendar;