'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FiChevronDown, FiChevronUp, FiEye, FiEyeOff } from 'react-icons/fi'; // Importing icons for dropdown effect

const colorOptions = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-gray-400'];

const Calendarapi = () => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false); // State to toggle dropdown
  const [popupVisible, setPopupVisible] = useState({}); // State for popup visibility
  const [visibleItems, setVisibleItems] = useState({});
  const [itemColors, setItemColors] = useState({});

  const familyBirthday = 'Family';
  const birthdays = 'Birthdays';
  const holidays = 'Holidays in United States';

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setEmail(data.email);
        setItemColors(data.preferences.colors || {});
        setVisibleItems(data.preferences.visibility || {});
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error fetching profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile(); // Fetch profile when component mounts
  }, []);

  const toggleVisibility = (item) => {
    const updatedVisibility = { ...visibleItems, [item]: !visibleItems[item] };
    setVisibleItems(updatedVisibility);
    savePreferences({ visibility: updatedVisibility, colors: itemColors });
  };

  const togglePopup = (item, e) => {
    if (e && e.preventDefault) {
      e.preventDefault(); // Prevent default right-click menu
    }
    setPopupVisible((prevState) => ({
      ...prevState,
      [item]: !prevState[item], // Toggle the popup for the clicked item
    }));
  };

  const changeColor = (item, color) => {
    const updatedColors = { ...itemColors, [item]: color };
    setItemColors(updatedColors);
    savePreferences({ visibility: visibleItems, colors: updatedColors });
    togglePopup(item); // Close the color picker after selection
  };

  const savePreferences = async (preferences) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/profile/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={`p-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
      {/* Email section with dropdown icon */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <p className={`text-sm ${darkMode ? 'text-gray-400 ' : 'text-gray-600 '}`}>
          {email}
        </p>
        {showDetails ? (
          <FiChevronUp className={`text-sm ${darkMode ? 'text-gray-400 ' : 'text-gray-600'}`} />
        ) : (
          <FiChevronDown className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        )}
      </div>

      {showDetails && (
        <div className="mt-2">
          {/* Email */}
          <div
            className={`flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-500 p-2 rounded transition-all duration-200 ${
              visibleItems.email ? '' : 'opacity-50'
            }`}
            onClick={() => toggleVisibility('email')}
            onContextMenu={(e) => togglePopup('email', e)} // Right-click to toggle popup
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${itemColors.email || 'bg-blue-500'}`}></div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{email}</p>
            </div>
            {visibleItems.email ? <FiEye /> : <FiEyeOff />}
          </div>

          {/* Family */}
          <div
            className={`flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-500 p-2 rounded transition-all duration-200 ${
              visibleItems.familyBirthday ? '' : 'opacity-50'
            }`}
            onClick={() => toggleVisibility('familyBirthday')}
            onContextMenu={(e) => togglePopup('familyBirthday', e)} // Right-click to toggle popup
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${itemColors.familyBirthday || 'bg-orange-500'}`}></div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{familyBirthday}</p>
            </div>
            {visibleItems.familyBirthday ? <FiEye /> : <FiEyeOff />}
          </div>

          {/* Birthdays */}
          <div
            className={`flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-500 p-2 rounded transition-all duration-200 ${
              visibleItems.birthdays ? '' : 'opacity-50'
            }`}
            onClick={() => toggleVisibility('birthdays')}
            onContextMenu={(e) => togglePopup('birthdays', e)} // Right-click to toggle popup
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${itemColors.birthdays || 'bg-green-500'}`}></div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{birthdays}</p>
            </div>
            {visibleItems.birthdays ? <FiEye /> : <FiEyeOff />}
          </div>

          {/* Holidays */}
          <div
            className={`flex items-center justify-between cursor-pointer hover:bg-gray-500 p-2 rounded transition-all duration-200 ${
              visibleItems.holidays ? '' : 'opacity-50'
            }`}
            onClick={() => toggleVisibility('holidays')}
            onContextMenu={(e) => togglePopup('holidays', e)} // Right-click to toggle popup
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${itemColors.holidays || 'bg-red-500'}`}></div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{holidays}</p>
            </div>
            {visibleItems.holidays ? <FiEye /> : <FiEyeOff />}
          </div>

          {/* Color Picker Popup */}
          {popupVisible.email && (
            <ColorPicker item="email" colors={colorOptions} onSelectColor={changeColor} />
          )}
          {popupVisible.familyBirthday && (
            <ColorPicker item="familyBirthday" colors={colorOptions} onSelectColor={changeColor} />
          )}
          {popupVisible.birthdays && (
            <ColorPicker item="birthdays" colors={colorOptions} onSelectColor={changeColor} />
          )}
          {popupVisible.holidays && (
            <ColorPicker item="holidays" colors={colorOptions} onSelectColor={changeColor} />
          )}
        </div>
        
      )}
    </div>
  );
};

const ColorPicker = ({ item, colors, onSelectColor }) => {
  return (
    <div className="absolute z-50 mt-2 bg-gray-800 p-2 rounded shadow-lg flex space-x-2">
      {colors.map((color) => (
        <div
          key={color}
          className={`w-6 h-6 rounded-full cursor-pointer ${color}`}
          onClick={() => onSelectColor(item, color)}
        ></div>
      ))}
    </div>
  );
};

export default Calendarapi;
