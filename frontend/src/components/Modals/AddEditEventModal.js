'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const AddEditEventModal = ({ onClose, onSave, initialDate }) => {
  const { darkMode } = useTheme();
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    frequency: 'Does not repeat',
    location: '',
    calendar: 'Personal'
  });

  useEffect(() => {
    if (initialDate) {
      setNewEvent(prev => ({
        ...prev,
        date: initialDate.toISOString().split('T')[0],
        startTime: initialDate.toTimeString().slice(0, 5)
      }));
    }
  }, [initialDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const event = {
      title: newEvent.title,
      location: newEvent.location,
      date: newEvent.date,
      start_time: new Date(`${newEvent.date}T${newEvent.startTime}`).toISOString(),
      end_time: new Date(`${newEvent.date}T${newEvent.endTime}`).toISOString(),
      frequency: newEvent.frequency,
      calendar: newEvent.calendar
    };
    console.log('Event being saved:', event);
    onSave(event); // Pass the event data to the parent component
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-6 rounded-lg w-96`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Add/Edit Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={handleChange}
            className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
            required
          />
          <input
            type="date"
            name="date"
            value={newEvent.date}
            onChange={handleChange}
            className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
            required
          />
          <div className="flex justify-between mb-4">
            <input
              type="time"
              name="startTime"
              value={newEvent.startTime}
              onChange={handleChange}
              className={`w-5/12 p-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
              required
            />
            <input
              type="time"
              name="endTime"
              value={newEvent.endTime}
              onChange={handleChange}
              className={`w-5/12 p-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
              required
            />
          </div>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={newEvent.location}
            onChange={handleChange}
            className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
          />
          <select
            name="frequency"
            value={newEvent.frequency}
            onChange={handleChange}
            className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
          >
            <option>Does not repeat</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
          <select
            name="calendar"
            value={newEvent.calendar}
            onChange={handleChange}
            className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
          >
            <option>Personal</option>
            <option>Work</option>
            <option>Family</option>
          </select>
          <div className="flex justify-between">
            <button type="button" onClick={onClose} className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} rounded`}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditEventModal;
