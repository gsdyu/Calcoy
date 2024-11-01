'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FiChevronDown, FiChevronUp, FiEye, FiEyeOff, FiPlus } from 'react-icons/fi';
import CalendarPopup from '../Modals/CalendarPopup';

const colorOptions = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-gray-400'];

const CalendarFilter = ({ onColorChange, itemColors }) => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMyCalendars, setShowMyCalendars] = useState(true);
  const [showOtherCalendars, setShowOtherCalendars] = useState(true);
  const [popupVisible, setPopupVisible] = useState({});
  const [visibleItems, setVisibleItems] = useState({});
  const [showImportPopup, setShowImportPopup] = useState(false);

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
        setUsername(data.username || 'My Calendar');
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

  const renderCalendarItem = (key, label, color, showEyeIcon = true) => (
    <div
      key={key}
      className={`flex items-center justify-between p-2 rounded transition-all duration-200 relative hover:bg-gray-500/10 ${
        visibleItems[key] ? '' : 'opacity-50'
      }`}
      onClick={(e) => {
        e.preventDefault();
        toggleVisibility(key, e);
      }}
      onContextMenu={(e) => togglePopup(key, e)}
    >
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${color || itemColors?.[key] || 'bg-gray-400'}`}></div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
      </div>
      {showEyeIcon && (
        <button
          className="p-2 hover:bg-gray-500/20 rounded"
          onClick={(e) => {
            e.stopPropagation();
            toggleVisibility(key, e);
          }}
        >
          {visibleItems[key] ? <FiEye /> : <FiEyeOff />}
        </button>
      )}
      {popupVisible[key] && (
        <ColorPicker item={key} colors={colorOptions} onSelectColor={changeColor} />
      )}
    </div>
  );

  return (
    <div className={`p-4 space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      {/* My Calendars Section */}
      <div className="space-y-2">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowMyCalendars(!showMyCalendars)}
        >
          <h3 className="font-medium">My calendars</h3>
          {showMyCalendars ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {showMyCalendars && (
          <div className="space-y-1 pl-2">
            {renderCalendarItem('email', username, itemColors?.email || 'bg-blue-500')}
            {renderCalendarItem('tasks', 'Tasks', itemColors?.tasks || 'bg-red-500')}
            {renderCalendarItem('birthdays', 'Birthdays', 'bg-green-500')}
            {renderCalendarItem('family', 'Family', 'bg-gray-400')}
          </div>
        )}
      </div>

      {/* Other Calendars Section */}
      <div className="space-y-2">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowOtherCalendars(!showOtherCalendars)}
        >
          <h3 className="font-medium">Other calendars</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowImportPopup(true);
            }}
            className={`p-2 hover:bg-gray-500/20 rounded transition-colors duration-200 ${
              darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiPlus className="w-4 h-4" />
          </button>
          {showOtherCalendars ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </div>
        
        {showOtherCalendars && (
          <div className="space-y-1 pl-2">
            {renderCalendarItem('google', email, 'bg-blue-500')}
            {renderCalendarItem('holidays', 'Holidays in United States', 'bg-yellow-500')}
          </div>
        )}
      </div>

      {showImportPopup && <CalendarPopup onClose={() => setShowImportPopup(false)} />}
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