'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Divide, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';


const AddEditEventModal = ({ onClose, onSave, initialDate }) => {
  const { darkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState('event');
  const eventButtonRef = useRef(null);
  const taskButtonRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderLeft, setSliderLeft] = useState(0);
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
    const selectedButton = selected === 'event' ? eventButtonRef.current : taskButtonRef.current;
    setSliderWidth(selectedButton.offsetWidth);
    setSliderLeft(selectedButton.offsetLeft);
  }, [selected]);

  useEffect(() => {
    setIsVisible(true);

    return () => {
      setIsVisible(false);
    };
  }, []);

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
    const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);
  
    if (endDateTime <= startDateTime) {
      alert('End time must be after start time');
      return;
    }
  
    const event = {
      title: newEvent.title,
      location: newEvent.location,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      frequency: newEvent.frequency,
      calendar: newEvent.calendar
    };
    console.log('Event being saved:', event);
    onSave(event);
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
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
      <div className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-black'} p-7 rounded-xl w-[550px] transition-transform duration-300 transform ${isVisible ? 'scale-100' : 'scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-medium">{selected === 'event' ? 'Create Event' : 'Create Task'}</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-200">
            <X size={25} />
          </button>
        </div>
        <div className={`relative ${darkMode ? 'bg-gray-400 border-gray-400' : 'bg-gray-200 border-gray-200'} rounded-[7px] flex items-center w-1/2 mb-4 border-4`}>
          <div
            className={`absolute h-full ${darkMode ? 'bg-white' : 'bg-blue-300'} rounded-[7px] transition-all duration-200 ease-in-out`}
            style={{ width: sliderWidth, left: sliderLeft }}
          />
          <button
            ref={eventButtonRef}
            onClick={() => setSelected('event')}
            className={`flex-grow px-4 py-1 z-10 rounded-[7px] transition-colors duration-200 ${
              selected === 'event' 
                ? `${darkMode ? 'text-gray-800' : 'text-white'} font-semibold` 
                : 'text-gray-700'
            }`}
          >
            Event
          </button>
          <button
            ref={taskButtonRef}
            onClick={() => setSelected('task')}
            className={`flex-grow px-4 py-1 z-10 rounded-[7px] transition-colors duration-200 ${
              selected === 'task' 
                ? `${darkMode ? 'text-gray-800' : 'text-white'} font-semibold` 
                : 'text-gray-700'
            }`}
          >
            Task
          </button>
        </div>
        <form onSubmit={handleSubmit}>
        <label className={`${darkMode ? ' text-gray-400' : 'text-black'} block font-medium pb-1`}>Event name</label>
          <input
            type="text"
            name="title"
            placeholder="Enter event name"
            value={newEvent.title}
            onChange={handleChange}
            className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
            required
          />
          <label className={`${darkMode ? ' text-gray-400' : 'text-black'} block font-medium pb-1`}>Date</label>
          <input
            type="date"
            name="date"
            value={newEvent.date}
            onChange={handleChange}
            className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
            required
          />
          <label className={`${darkMode ? ' text-gray-400' : 'text-black'} block font-medium pb-1`}>Time</label>
          <div className="flex justify-between mb-4">
            <input
              type="time"
              name="startTime"
              value={newEvent.startTime}
              onChange={handleChange}
              className={`w-5/12 p-3 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
              required
            />
            <input
              type="time"
              name="endTime"
              value={newEvent.endTime}
              onChange={handleChange}
              className={`w-5/12 p-3 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
              required
            />
          </div>
          <label className={`${darkMode ? ' text-gray-400' : 'text-black'} block font-medium pb-1`}>Location</label>
          <input
            type="text"
            name="location"
            placeholder="Add location"
            value={newEvent.location}
            onChange={handleChange}
            className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
          />
          <label className={`${darkMode ? ' text-gray-400' : 'text-black'} block font-medium pb-1`}>Frequency</label>
          <select
            name="frequency"
            value={newEvent.frequency}
            onChange={handleChange}
            className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
          >
            <option>Does not repeat</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
          <label className={`${darkMode ? ' text-gray-400' : 'text-black'} block font-medium pb-1`}>Occasion</label>
          <select
            name="calendar"
            value={newEvent.calendar}
            onChange={handleChange}
            className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
          >
            <option>Personal</option>
            <option>Work</option>
            <option>Family</option>
          </select>
          <div className="flex justify-end space-x-4 pt-5">
            <button type="button" onClick={onClose} className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} rounded-[7px]`}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[7px]">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditEventModal;
