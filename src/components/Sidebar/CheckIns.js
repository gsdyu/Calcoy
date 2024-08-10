import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const CheckIns = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`p-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
      <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Check-ins</h3>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No check-ins scheduled</p>
    </div>
  );
};

export default CheckIns;