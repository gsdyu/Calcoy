import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({ children, className, ...props }) => {
  const { darkMode } = useTheme();
  const baseClass = `px-4 py-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`;
  
  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;