'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import CalendarPopup from '../Modals/CalendarPopup';  

const CalendarButton = () => {
  const { darkMode } = useTheme();
  const [showPopup, setShowPopup] = useState(false);  // State to control popup visibility

  const handleButtonClick = () => {
    setShowPopup(true);  // Show the popup when the button is clicked
  };

  const handleClosePopup = () => {
    setShowPopup(false);  // Close the popup
  };

  return (
    <div className={`p-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
      <button
        onClick={handleButtonClick}
        className={`text-sm font-semibold ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} mb-2 transition-all duration-200`}
      >
        Import calendar account
      </button>

      {/* Conditionally render the popup */}
      {showPopup && <CalendarPopup onClose={handleClosePopup} />}
    </div>
  );
};

export default CalendarButton;
