import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FiChevronDown, FiChevronUp, FiEye, FiEyeOff, FiPlus } from 'react-icons/fi';
import CalendarPopup from '../Modals/CalendarPopup';

const colorOptions = [
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-orange-500', label: 'Orange' },
  { value: 'bg-yellow-500', label: 'Yellow' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-gray-400', label: 'Gray' }
];

const CalendarFilter = ({ onColorChange, itemColors, activeServer, servers, setServers, serverUsers, setServerUsers, otherCalendars, visibleItems, setVisibleItems }) => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMyCalendars, setShowMyCalendars] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calendarTypesExpanded');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [showServers, setShowServers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('serversExpanded');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [showOtherCalendars, setShowOtherCalendars] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('otherCalendarsExpanded');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [popupVisible, setPopupVisible] = useState({});
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [showUsers, setShowUsers] = useState(true);

  useEffect(() => {
    localStorage.setItem('calendarTypesExpanded', JSON.stringify(showMyCalendars));
  }, [showMyCalendars]);

  useEffect(() => {
    localStorage.setItem('serversExpanded', JSON.stringify(showServers));
  }, [showServers]);

  useEffect(() => {
    localStorage.setItem('otherCalendarsExpanded', JSON.stringify(showOtherCalendars));
  }, [showOtherCalendars]);

  // Fetch profile information
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
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error fetching profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [itemColors]);
  const scrollbarStyles = darkMode ? `
  .dark-scrollbar::-webkit-scrollbar {
    width: 12px;
  }
  .dark-scrollbar::-webkit-scrollbar-track {
    background: #2D3748;
  }
  .dark-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4A5568;
    border-radius: 6px;
    border: 3px solid #2D3748;
  }
  .dark-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #4A5568 #2D3748;
  }
` : '';

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/servers', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch servers');

        const data = await response.json();
        setServers(data.servers || []);
      } catch (error) {
        console.error('Error fetching servers:', error);
      }
    };
    fetchServers();
  }, [setServers]);

  const renderServerItem = (server, color , showEyeIcon = true) => (
    <div
      key={`server${server.id}`}
      className={`flex items-center justify-between p-2 rounded transition-all duration-200 relative hover:bg-gray-500/10 ${
        visibleItems[`server${server.id}`] ? '' : 'opacity-50'
      }`}
      onClick={(e) => {
        e.preventDefault();
        toggleVisibility(`server${server.id}`, e);
      }}
      onContextMenu={(e) => togglePopup(`server${server.id}`, e)}
    >
      <div className="flex items-center">
        {/* Display server image or fallback initial */}
        {server.image_url ? (
          <img 
            src={`http://localhost:5000${server.image_url}`} 
            alt={`${server.name} icon`} 
            className="w-4 h-4 mr-2 rounded-full"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-4 h-4 mr-2 bg-gray-400 rounded-full flex items-center justify-center text-xs">
            {server.name.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Color circle and server name */}
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${color || itemColors[`server${server.id}`] || 'bg-gray-400'}`}></div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{server.name}</p>
        </div>
      </div>
  
      {/* Eye icon toggle for visibility */}
      {showEyeIcon && (
        <button
          className="p-2 hover:bg-gray-500/20 rounded"
          onClick={(e) => {
            e.stopPropagation();
            toggleVisibility(`server${server.id}`, e);
          }}
        >
          {visibleItems[`server${server.id}`] ? <FiEye /> : <FiEyeOff />}
        </button>
      )}
  
      {/* Color picker popup */}
      {popupVisible[`server${server.id}`] && (
        <div 
          className={`
            absolute z-50 right-0 top-full mt-1 
            ${darkMode ? 'bg-gray-900' : 'bg-white'} 
            p-3 rounded-xl shadow-xl 
            border ${darkMode ? 'border-gray-800/10' : 'border-gray-200'}
            backdrop-blur-sm
          `}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-wrap gap-2 min-w-[140px]">
            {colorOptions.map(({ value, label }) => (
              <button
                key={value}
                className={`
                  group relative w-7 h-7 rounded-full ${value}
                  transition-all duration-200
                  hover:scale-110
                  ${itemColors?.[`server${server.id}`] === value ? 
                    'ring-2 ring-blue-400 ring-offset-2 ' + 
                    (darkMode ? 'ring-offset-gray-900' : 'ring-offset-white')
                    : ''
                  }
                  before:absolute before:inset-0 
                  before:rounded-full before:transition-opacity
                  before:duration-200 before:opacity-0
                  hover:before:opacity-100
                  before:bg-gradient-to-br before:from-white/20 before:to-transparent
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  changeColor(`server${server.id}`, value);
                }}
              >
                <span className={`
                  absolute -top-6 left-1/2 -translate-x-1/2 text-xs
                  opacity-0 group-hover:opacity-100 whitespace-nowrap 
                  ${darkMode ? 'text-gray-400' : 'text-gray-600'}
                  transition-opacity duration-200 z-50
                `}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Fetch users tied to the selected server
  useEffect(() => {
    const fetchServerUsers = async () => {
      if (!activeServer) {
        setServerUsers([]);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/servers/${activeServer.id}/users`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch server users');
        }
        const data = await response.json();
        
        setServerUsers(data || []);
      } catch (error) {
        console.error('Error fetching server users:', error);
        setError('Error fetching server users. Please try again later.');
      }
    };

    fetchServerUsers();
  }, [activeServer, setServerUsers]);

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
      [item]: !prev[item],
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
        body: JSON.stringify({ preferences: { ...preferences } }),    
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

  const renderCalendarItem = (key, label, color, showEyeIcon = true) => { 

    if (!(key in visibleItems)) {
      const updatedVisibility = { ...visibleItems, [key]: !visibleItems[key] };
      setVisibleItems(updatedVisibility);
      savePreferences({ visibility: updatedVisibility, colors: itemColors });
    }

    return (
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
        <div 
          className={`
            absolute z-50 right-0 top-full mt-1 
            ${darkMode ? 'bg-gray-900' : 'bg-white'} 
            p-3 rounded-xl shadow-xl 
            border ${darkMode ? 'border-gray-800/10' : 'border-gray-200'}
            backdrop-blur-sm
          `}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-wrap gap-2 min-w-[140px]">
            {colorOptions.map(({ value, label }) => (
              <button
                key={value}
                className={`
                  group relative w-7 h-7 rounded-full ${value}
                  transition-all duration-200
                  hover:scale-110
                  ${itemColors?.[key] === value ? 
                    'ring-2 ring-blue-400 ring-offset-2 ' + 
                    (darkMode ? 'ring-offset-gray-900' : 'ring-offset-white')
                    : ''
                  }
                  before:absolute before:inset-0 
                  before:rounded-full before:transition-opacity
                  before:duration-200 before:opacity-0
                  hover:before:opacity-100
                  before:bg-gradient-to-br before:from-white/20 before:to-transparent
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  changeColor(key, value);
                }}
              >
                <span className={`
                  absolute -top-6 left-1/2 -translate-x-1/2 text-xs
                  opacity-0 group-hover:opacity-100 whitespace-nowrap 
                  ${darkMode ? 'text-gray-400' : 'text-gray-600'}
                  transition-opacity duration-200 z-50
                `}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    )};

  return (
    <div className={`flex-1 overflow-y-auto time-grid-container ${darkMode ? 'dark-scrollbar' : ''} relative`}>
      <style>{scrollbarStyles}</style>
    
      <div>
        <div
          className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-500/10 transition-colors duration-200"
          onClick={() => {
            const newState = !showMyCalendars;
            setShowMyCalendars(newState);
            localStorage.setItem('calendarTypesExpanded', JSON.stringify(newState));
          }}
        >
          <h3 className="font-medium">Calendar Types</h3>
          {showMyCalendars ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {showMyCalendars && (
          <div className="space-y-1 pl-2">
            {renderCalendarItem('Personal', 'Personal', itemColors?.Personal || 'bg-blue-500')}
            {renderCalendarItem('Task', 'Tasks', itemColors?.Task || 'bg-red-500')}
            {renderCalendarItem('Birthday', 'Birthdays', 'bg-green-500')}
            {renderCalendarItem('Family', 'Family', 'bg-gray-400')}
          </div>
        )}
      </div>

      {!activeServer ? (
        <>
          <div>
            {/* Servers Dropdown */}
            <div
              className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-500/10 transition-colors duration-200"
              onClick={() => {
                const newState = !showServers;
                setShowServers(newState);
                localStorage.setItem('serversExpanded', JSON.stringify(newState));
              }}
            >
              <h3 className="font-medium">Servers</h3>
              {showServers ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {showServers && (
              <div className="space-y-1 pl-2">
                {servers.map((server) => renderServerItem(server, itemColors?.[`server${server.id}`] || itemColors?.server_default))}
              </div>
            )}
          </div>
          {/* Other Calendars Section */}

          <div>
            <div
              className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-500/10 transition-colors duration-200"
              onClick={() => {
                const newState = !showOtherCalendars;
                setShowOtherCalendars(newState);
                localStorage.setItem('otherCalendarsExpanded', JSON.stringify(newState));
              }}
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
                {renderCalendarItem('holidays', 'Holidays in United States', itemColors?.holidays || 'bg-yellow-500')}
                {otherCalendars.map(otherCalendar => renderCalendarItem(
                  `${otherCalendar.imported_from}:${otherCalendar.imported_username}`, 
                  (otherCalendar.imported_from === otherCalendar.imported_username) 
                    ? otherCalendar.imported_from 
                    : `${otherCalendar.imported_from}: ${otherCalendar.imported_username}`, 
                  itemColors?.[`${otherCalendar.imported_from}:${otherCalendar.imported_username}`] || 'bg-green-500'
                ))}
              </div>
            )}
          </div>
          {showImportPopup && <CalendarPopup onClose={() => setShowImportPopup(false)} onColorChange={onColorChange}/>}
        </>
      ) : (
        <div>
          <div
            className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-500/10 transition-colors duration-200"
            onClick={() => setShowUsers(!showUsers)}
          >
            <h3 className="font-medium">Users</h3>
            {showUsers ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          {showUsers && (
            <div className="space-y-1 pl-2">
              {serverUsers.map(user => renderCalendarItem(
                `server${user.server_id}:user${user.id}`, 
                user.username, 
                itemColors?.[`server${user.server_id}:user${user.id}`] || 
                itemColors?.[`server${user.server_id}`] || 
                itemColors?.server_default
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarFilter;
