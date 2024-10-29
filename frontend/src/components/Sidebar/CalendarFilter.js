'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FiChevronDown, FiChevronUp, FiEye, FiEyeOff } from 'react-icons/fi';

const colorOptions = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-gray-400'];

const CalendarFilter = ({ onColorChange, itemColors }) => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [popupVisible, setPopupVisible] = useState({});
  const [visibleItems, setVisibleItems] = useState({});

  const familyBirthday = 'Family';
  const birthdays = 'Birthdays';
  const holidays = 'Holidays in United States';

  useEffect(() => {
    const fetchProfile = async () => {
      const check = await fetch('http://localhost:5000/auth/check', {
        credentials: 'include',
      });
      if (!check.ok) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/profile', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setEmail(data.email);
        setVisibleItems(data.preferences.visibility || {});
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error fetching profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const toggleVisibility = (item, e) => {
    if (e) {
      e.stopPropagation();
    }
    const updatedVisibility = { ...visibleItems, [item]: !visibleItems[item] };
    setVisibleItems(updatedVisibility);
    savePreferences({ visibility: updatedVisibility, colors: itemColors });
  };

  const togglePopup = (item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setPopupVisible(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const changeColor = (item, color) => {
    if (onColorChange) {
      onColorChange(item, color);
    }
    togglePopup(item);
  };

  const savePreferences = async (preferences) => {
    try {
      const response = await fetch('http://localhost:5000/profile/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
    <div className={`p-4 border-t relative ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {email}
        </p>
        {showDetails ? (
          <FiChevronUp className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        ) : (
          <FiChevronDown className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        )}
      </div>

      {showDetails && (
        <div className="mt-2">
          {/* Email */}
          <div
            className={`flex items-center justify-between mb-2 p-2 rounded transition-all duration-200 relative ${
              visibleItems.email ? '' : 'opacity-50'
            }`}
            onClick={() => toggleVisibility('email')}
            onContextMenu={(e) => togglePopup('email', e)}
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${itemColors?.email || 'bg-blue-500'}`}></div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{email}</p>
            </div>
            <button
              className="p-2 hover:bg-gray-500/20 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility('email', e);
              }}
            >
              {visibleItems.email ? <FiEye /> : <FiEyeOff />}
            </button>
            {popupVisible.email && (
              <ColorPicker item="email" colors={colorOptions} onSelectColor={changeColor} />
            )}
          </div>

          {/* Family, Birthdays, and Holidays */}
          {[
            { key: 'familyBirthday', label: familyBirthday },
            { key: 'birthdays', label: birthdays },
            { key: 'holidays', label: holidays }
          ].map(({ key, label }) => (
            <div
              key={key}
              className={`flex items-center justify-between mb-2 p-2 rounded transition-all duration-200 relative ${
                visibleItems[key] ? '' : 'opacity-50'
              }`}
              onClick={() => toggleVisibility(key)}
              onContextMenu={(e) => togglePopup(key, e)}
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${itemColors?.[key] || 'bg-gray-400'}`}></div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
              </div>
              <button
                className="p-2 hover:bg-gray-500/20 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(key, e);
                }}
              >
                {visibleItems[key] ? <FiEye /> : <FiEyeOff />}
              </button>
              {popupVisible[key] && (
                <ColorPicker item={key} colors={colorOptions} onSelectColor={changeColor} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ColorPicker = ({ item, colors, onSelectColor }) => {
  return (
    <div 
      className="absolute z-50 right-0 top-full mt-1 bg-gray-800/95 p-2 rounded shadow-lg flex space-x-2"
      onClick={e => e.stopPropagation()}
    >
      {colors.map((color) => (
        <button
          key={color}
          className={`w-6 h-6 rounded-full ${color} hover:ring-2 hover:ring-white transition-all duration-200`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectColor(item, color);
          }}
        />
      ))}
    </div>
  );
};

export default CalendarFilter;