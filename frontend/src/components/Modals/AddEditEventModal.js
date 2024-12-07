'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const AddEditEventModal = ({ onClose, onSave, initialDate, event }) => {
  const { darkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState('event');
  const [showTaskTime, setShowTaskTime] = useState(false);

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDefaultTimeRange = (date = new Date()) => {
    const roundedDate = new Date(date);
    roundedDate.setMinutes(Math.ceil(roundedDate.getMinutes() / 30) * 30);
    roundedDate.setSeconds(0);
    roundedDate.setMilliseconds(0);

    const endDate = new Date(roundedDate);
    endDate.setHours(endDate.getHours() + 1);

    return {
      startTime: roundedDate.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }).slice(0, 5),
      endTime: endDate.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }).slice(0, 5)
    };
  };
  
  // State for events
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: initialDate ? getLocalDateString(initialDate) : getLocalDateString(new Date()),
    startTime: '',
    endTime: '',
    allDay: false,
    frequency: 'Does not repeat',
    location: '',
    calendar: 'Personal'
  });

  // State for tasks
  const [newTask, setNewTask] = useState({
    title: '',
    date: initialDate ? getLocalDateString(initialDate) : getLocalDateString(new Date()),
    time: '',
    frequency: 'Does not repeat',
  });

  useEffect(() => {
    setIsVisible(true);
    
    if (event) {
      if (event.isHoliday) {
        // Don't set any form state for holidays as they're read-only
        return;
      }
      // Handle editing existing event
      if (event.calendar === 'Task') {
        setSelected('task');
        const startDate = new Date(event.start_time);
        const hasTime = !event.allDay;
        setShowTaskTime(hasTime);
        setNewTask({
          title: event.title,
          date: getLocalDateString(startDate),
          time: hasTime ? startDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }).slice(0, 5) : '',
          frequency: event.frequency || 'Does not repeat',
        });
      } else {
        const startDate = new Date(event.start_time);
        const endDate = new Date(event.end_time);
        setNewEvent({
          title: event.title,
          date: getLocalDateString(startDate),
          startTime: startDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }).slice(0, 5),
          endTime: endDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }).slice(0, 5),
          allDay: event.allDay || false,
          frequency: event.frequency || 'Does not repeat',
          location: event.location || '',
          calendar: event.calendar || 'Personal'
        });
      }
    } else if (initialDate && (initialDate.getHours() !== 0 || initialDate.getMinutes() !== 0)) {
      // Handle clicks from WeekView/DayView with rounded times
      const startDate = new Date(initialDate);
      const minutes = startDate.getMinutes();
      
      // Round to nearest 30 minutes
      if (minutes < 30) {
        startDate.setMinutes(0);
      } else {
        startDate.setMinutes(30);
      }
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
    
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);
      endDate.setMinutes(startDate.getMinutes()); 
    
      setNewEvent(prev => ({
        ...prev,
        date: getLocalDateString(startDate),
        startTime: startDate.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }).slice(0, 5),
        endTime: endDate.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }).slice(0, 5)
      }));
      
      setNewTask(prev => ({
        ...prev,
        date: getLocalDateString(startDate),
        time: startDate.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }).slice(0, 5)
      }));
    } else {
      // Use default time range for MonthView clicks and Add Event button
      const { startTime, endTime } = getDefaultTimeRange();
      setNewEvent(prev => ({
        ...prev,
        startTime,
        endTime
      }));
      setNewTask(prev => ({
        ...prev,
        time: startTime
      }));
    }
  }, [event, initialDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let eventData;

    if (selected === 'task') {
      const taskDate = new Date(newTask.date + 'T00:00:00'); 
      
      if (!showTaskTime || !newTask.time) {
        // All-day task - set to local midnight
        eventData = {
          title: newTask.title.trim() || "(No title)",
          start_time: new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()).toISOString(),
          end_time: new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate() + 1).toISOString(),
          location: '',
          frequency: newTask.frequency,
          calendar: 'Task',
          allDay: true,
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      
      } else {
        // Task with specific time
        const [hours, minutes] = newTask.time.split(':');
        const taskDateTime = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate(), 
          Number(hours), Number(minutes));
        
        eventData = {
          title: newTask.title.trim() || "(No title)",
          start_time: taskDateTime.toISOString(),
          end_time: new Date(taskDateTime.getTime() + 30 * 60000).toISOString(),
          location: '',
          frequency: newTask.frequency,
          calendar: 'Task',
          allDay: false,
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      }
    } else {
      // Regular event
      let startDateTime, endDateTime;
      
      if (newEvent.allDay) {
        startDateTime = new Date(`${newEvent.date}T00:00:00`);
        const nextDay = new Date(startDateTime);
        nextDay.setDate(nextDay.getDate() + 1);
        endDateTime = nextDay;
      } else {
        startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
        endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);
        
        // Handle events that cross midnight, including month boundaries
        if (endDateTime <= startDateTime) {
          // Create a new date for the end time
          endDateTime = new Date(startDateTime);
          // First set the time
          const [endHours, endMinutes] = newEvent.endTime.split(':');
          endDateTime.setHours(Number(endHours), Number(endMinutes), 0);
          // Then add a day to handle month/year boundaries correctly
          endDateTime.setDate(endDateTime.getDate() + 1);
        }
      }

      eventData = {
        title: newEvent.title.trim() || "(No title)",
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: newEvent.location,
        frequency: newEvent.frequency,
        calendar: newEvent.calendar,
        allDay: newEvent.allDay,
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        crossesMidnight: endDateTime.getDate() !== startDateTime.getDate() ||
                        endDateTime.getMonth() !== startDateTime.getMonth() ||
                        endDateTime.getFullYear() !== startDateTime.getFullYear()
      };
    }

    // If editing existing event, include the id
    if (event?.id) {
      eventData.id = event.id;
    }

    onSave(eventData);
    handleClose();
  };


  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // If this is a holiday, render the holiday view
  if (event?.isHoliday) {
    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div 
          className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-black'} p-7 rounded-xl w-[550px] transition-transform duration-300 transform ${isVisible ? 'scale-100' : 'scale-95'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-medium">{event.title}</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-200">
              <X size={25} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Date</label>
              <p className="text-lg">
                {new Date(event.start_time).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {event.type && (
              <div>
                <label className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Type</label>
                <p className="text-lg capitalize">{event.type}</p>
              </div>
            )}

            {event.description && (
              <div>
                <label className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Description</label>
                <p className="text-lg">{event.description}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <button 
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[7px] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular event/task modal
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-black'} p-7 rounded-xl w-[550px] transition-transform duration-300 transform ${isVisible ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-medium">
            {event ? 'Edit' : 'Create'} {selected === 'task' ? 'Task' : 'Event'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-200">
            <X size={25} />
          </button>
        </div>

        {/* Toggle between Event and Task */}
        {!event && (
          <div className="flex justify-center mb-4">
          <div className={`relative ${darkMode ? 'bg-gray-400 border-gray-400' : 'bg-gray-200 border-gray-200'} rounded-[7px] flex items-center w-1/2 mb-4 border-4`}>
            <div
              className={`absolute h-full w-1/2 ${darkMode ? 'bg-white' : 'bg-blue-300'} rounded-[7px] transition-transform duration-200 ease-in-out ${
                selected === 'event' ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
            <button
              onClick={() => setSelected('event')}
              className={`w-1/2 px-4 py-1 z-10 rounded-[7px] flex justify-center items-center transition-colors duration-200 ${
                selected === 'event' 
                  ? `${darkMode ? 'text-gray-800' : 'text-white'} font-semibold` 
                  : 'text-gray-700'
              }`}
            >
              Event
            </button>
            <button
              onClick={() => setSelected('task')}
              className={`w-1/2 px-4 py-1 z-10 rounded-[7px] flex justify-center items-center transition-colors duration-200 ${
                selected === 'task' 
                  ? `${darkMode ? 'text-gray-800' : 'text-white'} font-semibold` 
                  : 'text-gray-700'
              }`}
            >
              <Check className="w-4 h-4 mr-1" />
              Task
            </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {selected === 'task' ? (
            // Task Form
            <>
              <label className={`${darkMode ? 'text-gray-400' : 'text-black'} block font-medium pb-1`}>Task title</label>
              <div className="flex items-center mb-4">
                <Check className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className={`flex-1 p-3 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
                />
              </div>

              <label className={`${darkMode ? 'text-gray-400' : 'text-black'} block font-medium pb-1`}>Due date</label>
              <input
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
                required
              />

              <div className="flex items-center mb-4">
                <button
                  type="button"
                  onClick={() => setShowTaskTime(!showTaskTime)}
                  className={`flex items-center ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <Clock className="w-5 h-5 mr-2" />
                  {showTaskTime ? 'Remove time' : 'Add time'}
                </button>
              </div>

              {showTaskTime && (
                <>
                  <label className={`${darkMode ? 'text-gray-400' : 'text-black'} block font-medium pb-1`}>Time</label>
                  <input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
                  />
                </>
              )}

              <label className={`${darkMode ? 'text-gray-400' : 'text-black'} block font-medium pb-1`}>Repeat</label>
              <select
                value={newTask.frequency}
                onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
              >
                <option>Does not repeat</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </>
          ) : (
            // Event Form
            <>
              <label className={`${darkMode ? 'text-gray-400' : 'text-black'} block font-medium pb-1`}>Event name</label>
              <input
                type="text"
                name="title"
                placeholder="Enter event name"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
              />

              <label className={`${darkMode ? 'text-gray-400' : 'text-black'} block font-medium pb-1`}>Date</label>
              <input
                type="date"
                name="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
                required
              />

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="allDay"
                  id="allDay"
                  checked={newEvent.allDay}
                  onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="allDay" className={`${darkMode ? 'text-gray-400' : 'text-black'}`}>All-day event</label>
              </div>

              {!newEvent.allDay && (
                <>
                  <label className={`${darkMode ? 'text-gray-400' : 'text-black'} block font-medium pb-1`}>Time</label>
                  <div className="flex justify-between mb-4">
                    <input
                      type="time"
                      name="startTime"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className={`w-5/12 p-3 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
                      required
                    />
                    <input
                      type="time"
                      name="endTime"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className={`w-5/12 p-3 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
                      required
                    />
                  </div>
                </>
              )}

              <label className={`${darkMode ? 'text-gray-400' : 'text-black'} block font-medium pb-1`}>Location</label>
              <input
                type="text"
                name="location"
                placeholder="Add location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
              />

              <label className={`${darkMode ? 'text-gray-400' : 'text-black'} block font-medium pb-1`}>Frequency</label>
              <select
                name="frequency"
                value={newEvent.frequency}
                onChange={(e) => setNewEvent({ ...newEvent, frequency: e.target.value })}
                className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
              >
                <option>Does not repeat</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>

              <label className={`${darkMode ? 'text-gray-400' : 'text-black'} block font-medium pb-1`}>Calendar</label>
              <select
                name="calendar"
                value={newEvent.calendar}
                onChange={(e) => setNewEvent({ ...newEvent, calendar: e.target.value })}
                className={`w-full p-3 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-100'} rounded-[7px]`}
              >
                <option>Personal</option>
              </select>
            </>
          )}

          <div className="flex justify-end space-x-4 pt-5">
            <button 
              type="button" 
              onClick={handleClose}
              className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} rounded-[7px]`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[7px]"
            >
              {event ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditEventModal;
