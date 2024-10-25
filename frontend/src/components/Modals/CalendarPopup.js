'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { FcGoogle } from 'react-icons/fc'; // Import Google Icon
import { FiCalendar } from 'react-icons/fi'; // Import Calendar Icon
import Googleapi from '@/components/API/Googleapi';

const CalendarPopup = ({ onClose }) => {
  const { darkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const { handleGoogleCalendarAuth } = Googleapi(); // Get the handleGoogleCalendarAuth function

  useEffect(() => {
    setIsVisible(true);  // Animate modal to become visible when opened
    return () => {
      setIsVisible(false);  // Animate modal to close when it’s unmounted
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);  // Delay the actual close to let the fade-out animation complete
  };

  const handleCanvasOption = () => {
    console.log('Canvas option selected');
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-black'} p-10 rounded-xl w-[600px] transition-transform duration-300 transform ${isVisible ? 'scale-100' : 'scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-semibold">Add Calendar Account</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-200">
            <X size={28} />
          </button>
        </div>

        <p className="mb-6 text-lg">Link your Calendar accounts to view events in your calendar.</p>

        {/* Google Authentication Option */}
        <button
          onClick={handleGoogleCalendarAuth}  // Use the function from Googleapi
          className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-[7px] transition-all duration-200 mb-4"
        >
          <FcGoogle size={24} className="mr-3" /> Connect with Google
        </button>

        {/* Canvas Option */}
        <button
          onClick={handleCanvasOption}
          className="flex items-center justify-center w-full bg-gray-300 hover:bg-gray-400 text-black p-4 rounded-[7px] transition-all duration-200"
        >
          <FiCalendar size={24} className="mr-3" /> Connect with Canvas
        </button>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleClose}
            className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} rounded-[7px] transition-all duration-200`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPopup;
