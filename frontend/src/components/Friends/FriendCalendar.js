import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

const FriendCalendar = ({ friend }) => {
  const { darkMode } = useTheme();
  const containerRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventsPerDay] = useState(2);

  // Fetch friend’s events
  const fetchFriendEvents = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/friends/${friend.id}/events`, {
        method: 'GET',
        credentials: 'include',
      });
  
      const data = await response.json();
  
      // Ensure `data` is an array
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        // Handle cases where "limited" or "private" privacy doesn't return events
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching friend events:', error);
      setEvents([]); // Fallback to an empty array
    }
  };
  
  useEffect(() => {
    if (friend) {
      fetchFriendEvents();
    }
  }, [friend]);

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };
  const renderEventCompact = (event) => {
    const calendarType = event.calendar || 'default';
    const eventColor = (() => {
      switch (calendarType) {
        case 'Task':
          return 'bg-red-500';
        case 'Personal':
          return 'bg-blue-500';
        case 'Work':
          return 'bg-purple-500';
        default:
          return 'bg-gray-400';
      }
    })();
  
    const isTask = event.calendar === 'Task';
    const isCompleted = event.completed;
    const eventTime = new Date(event.start_time).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  
    return (
      <div
        key={`${event.username || event.title}-${event.start_time}`}
        className={`
          flex justify-between items-center
          text-xs mb-1 truncate
          rounded-full py-1 px-2
          ${isCompleted ? 'opacity-50' : ''}
          ${eventColor} text-white
          hover:bg-opacity-90 transition-colors duration-200
          ${isTask && isCompleted ? 'line-through' : ''}
        `}
      >
        <div className="flex items-center overflow-hidden">
          {isTask ? (
            <Check className={`w-3 h-3 mr-1 flex-shrink-0 ${isCompleted ? 'opacity-50' : ''}`} />
          ) : (
            <span className="inline-block w-2 h-2 rounded-full bg-white/50 mr-1 flex-shrink-0" />
          )}
          <span className={`truncate ${isTask && isCompleted ? 'line-through' : ''}`}>
            {event.username || event.title}
          </span>
        </div>
        <span className={`ml-1 text-[10px] text-white/75 ${isCompleted ? 'opacity-50' : ''}`}>
          {eventTime}
        </span>
      </div>
    );
  };
  

  const renderCalendar = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    const days = [];
    let dayCounter = 1;

    for (let i = 0; i < 35; i++) {
      let dayNumber;
      let isCurrentMonth = true;

      if (i < firstDay) {
        dayNumber = '';
        isCurrentMonth = false;
      } else if (dayCounter <= daysInMonth) {
        dayNumber = dayCounter;
        dayCounter++;
      } else {
        dayNumber = '';
        isCurrentMonth = false;
      }

      const date = dayNumber ? new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber) : null;
      const isCurrentDay = date && isToday(date);
      const isWeekendDay = date && isWeekend(date);

      const dayEvents = date 
        ? events.filter(event => {
            const eventDate = new Date(event.start_time);
            return eventDate.getDate() === date.getDate() &&
                   eventDate.getMonth() === date.getMonth() &&
                   eventDate.getFullYear() === date.getFullYear();
          })
        : [];

      days.push(
        <div
          key={i}
          className={`
            border-r border-b relative p-1
            ${darkMode 
              ? 'border-gray-700/80' 
              : 'border-gray-200'}
            ${!isCurrentMonth 
              ? darkMode ? 'bg-gray-900' : 'bg-gray-50' 
              : ''}
            ${isCurrentMonth && isWeekendDay 
              ? darkMode ? 'bg-gray-800/90' : 'bg-gray-100' 
              : isCurrentMonth 
                ? darkMode ? 'bg-gray-800' : 'bg-white' 
                : ''}
            transition-colors duration-200
          `}
          style={{ height: '100px' }}
        >
          {dayNumber && (
            <>
              <span
                className={`
                  inline-flex items-center justify-center
                  w-6 h-6 text-sm mb-1
                  ${isCurrentDay 
                    ? 'bg-blue-500 text-white rounded-full' 
                    : isWeekendDay 
                      ? darkMode ? 'text-gray-300' : 'text-gray-600'
                      : darkMode ? 'text-gray-200' : 'text-gray-900'}
                `}
              >
                {dayNumber}
              </span>
              <div className="space-y-0.5">
                {dayEvents.slice(0, eventsPerDay).map(event => renderEventCompact(event))}
                {dayEvents.length > eventsPerDay && (
                  <button
                    className={`text-[10px] px-1.5 transition-colors
                      ${darkMode 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle showing more events
                    }}
                  >
                    +{dayEvents.length - eventsPerDay} more
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div 
      ref={containerRef} 
      className={`w-full rounded-xl overflow-hidden border
        ${darkMode 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'}`}
    >
      <div className={`p-4 border-b flex items-center justify-between
        ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className="text-lg">
          <span className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {currentDate.toLocaleString('default', { month: 'long' })}
          </span>
          <span className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentDate.getFullYear()}
          </span>
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className={`p-2 rounded-full transition-colors
              ${darkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors
              ${darkMode 
                ? 'bg-gray-800 text-gray-300 hover:text-gray-200 hover:bg-gray-700' 
                : 'bg-gray-100 text-gray-700 hover:text-gray-900 hover:bg-gray-200'}`}
          >
            Today
          </button>
          
          <button
            onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className={`p-2 rounded-full transition-colors
              ${darkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-7 border-b
        ${darkMode ? 'border-gray-700/80' : 'border-gray-200'}`}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div
            key={day}
            className={`py-2 text-xs font-medium text-center border-r
              ${darkMode 
                ? 'text-gray-400 border-gray-700/80' 
                : 'text-gray-600 border-gray-200'}`}
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className={`grid grid-cols-7 border-l
        ${darkMode ? 'border-gray-700/80' : 'border-gray-200'}`}>
        {renderCalendar()}
      </div>
    </div>
  );
};

export default FriendCalendar;
