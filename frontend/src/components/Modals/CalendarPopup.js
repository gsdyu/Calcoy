'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { FcGoogle } from 'react-icons/fc';
import { FiCalendar } from 'react-icons/fi';
import Googleapi from '@/components/API/Googleapi';
import ICAL from 'ical.js';

const CalendarPopup = ({ onClose, onColorChange }) => {
  const { darkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [showCanvasInput, setShowCanvasInput] = useState(false);
  const [canvasUrl, setCanvasUrl] = useState('');
  const [events, setEvents] = useState([]);
  const [errorMessage, setErrorMessage] = useState(''); // New state for error message
  const { handleGoogleCalendarAuth } = Googleapi();

  useEffect(() => {
    setIsVisible(true);
    return () => {
      setIsVisible(false);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleCanvasOption = () => {
    setShowCanvasInput(!showCanvasInput);
  };

  const handleCanvasImport = async () => {
    setErrorMessage(''); // Reset error message
    if (canvasUrl) {
      try {
        const response = await fetch('http://localhost:5000/auth/proxy-fetch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ url: canvasUrl })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch calendar data: ${errorText}`);
        }

        const { message } = await response.json();
        console.log("Import successful:", message);
        onColorChange('csulb:csulb', 'bg-green-500')
        window.location.href = '/calendar';

      } catch (error) {
        setErrorMessage('URL is invalid'); // Display error message in red
      }
    } else {
      setErrorMessage('Please enter a valid Canvas URL');
    }
  };

  // Helper function to parse ICS data
  const parseIcsData = (data) => {
    const jcalData = ICAL.parse(data);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');

    return vevents.map(event => {
      const vEvent = new ICAL.Event(event);
      return {
        title: vEvent.summary,
        start: vEvent.startDate.toJSDate(),
        end: vEvent.endDate.toJSDate(),
        description: vEvent.description,
        location: vEvent.location,
      };
    });
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

        {errorMessage && (
          <div className="text-red-500 mb-4">{errorMessage}</div> // Error message in red
        )}

        <button
          onClick={handleGoogleCalendarAuth}
          className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-[7px] transition-all duration-200 mb-4"
        >
          <FcGoogle size={24} className="mr-3" /> Connect with Google
        </button>

        <button
          onClick={handleCanvasOption}
          className="flex items-center justify-center w-full bg-gray-300 hover:bg-gray-400 text-black p-4 rounded-[7px] transition-all duration-200"
        >
          <FiCalendar size={24} className="mr-3" /> Connect with Canvas
        </button>

        {showCanvasInput && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter Canvas Calendar URL"
              value={canvasUrl}
              onChange={(e) => setCanvasUrl(e.target.value)}
              className={`w-full p-3 mb-4 border rounded-[7px] focus:outline-none ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-black'}`}
            />
            <button
              onClick={handleCanvasImport}
              className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'} p-3 rounded-[7px] transition-all duration-200`}
            >
              Import Canvas Events
            </button>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={handleClose}
            className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} rounded-[7px] transition-all duration-200`}
          >
            Close
          </button>
        </div>

        {events.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xl font-semibold mb-4">Imported Events</h4>
            <ul>
              {events.map((event, index) => (
                <li key={index} className="mb-2">
                  <strong>{event.title}</strong> - {event.start.toLocaleString()} to {event.end.toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPopup;
