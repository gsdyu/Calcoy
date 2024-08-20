'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const Toggle = ({ isOn, onToggle }) => {
  const { darkMode } = useTheme();

  return (
    <div 
      onClick={onToggle}
      className={`${isOn ? 'bg-blue-600' : darkMode ? 'bg-gray-700' : 'bg-gray-300'} 
                  relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ease-in-out duration-200`}
    >
      <span 
        className={`${isOn ? 'translate-x-6' : 'translate-x-1'} 
                    inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200`}
      />
    </div>
  );
};

export default Toggle;