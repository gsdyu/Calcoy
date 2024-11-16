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

const CalendarFilter = ({ onColorChange, itemColors, activeServer }) => {
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
  const [serverUsers, setServerUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(true); // New state for Users dropdown
  const [servers, setServers] = useState([]);  
  const [showServers, setShowServers] = useState(true);  
  const [serverColors, setServerColors] = useState({}); 
  
  // Fetch profile information
  useEffect(() => {
    const fetchProfile = async () => {
      const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
        credentials: 'include',
      });
      if (!check.ok) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile`, {
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
        setServerColors(data.preferences.serverColors || {});  
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error fetching profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, []);
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/servers`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch servers');

        const data = await response.json();
        setServers(data.servers || []);
        setServerColors(
          data.servers.reduce((acc, server) => {
            acc[server.id] = colorOptions[server.id % colorOptions.length];  
            return acc;
          }, {})
        );
      } catch (error) {
        console.error('Error fetching servers:', error);
      }
    };
    fetchServers();
  }, []);
 
  
  
  const renderServerItem = (server, showEyeIcon = true,color) => (
    <div
      key={server.id}
      className={`flex items-center justify-between p-2 rounded transition-all duration-200 relative hover:bg-gray-500/10 ${
        visibleItems[server.id] ? '' : 'opacity-50'
      }`}
      onClick={(e) => {
        e.preventDefault();
        toggleVisibility(server.id, e);
      }}
      onContextMenu={(e) => togglePopup(server.id, e)} // Open color picker on right-click
    >
      <div className="flex items-center">
        {/* Display server image or fallback initial */}
        {server.image_url ? (
          <img 
            src={`${process.env.NEXT_PUBLIC_SERVER_URL}${server.image_url}`} 
            alt={`${server.name} icon`} 
            className="w-4 h-4 mr-2 rounded-full"
            onError={(e) => { e.target.style.display = 'none'; }} // Fallback if image fails
          />
        ) : (
          <div className="w-4 h-4 mr-2 bg-gray-400 rounded-full flex items-center justify-center text-xs">
            {server.name.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Color circle and server name */}
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${color || itemColors[server.id] || 'bg-gray-400'}`}></div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{server.name}</p>
        </div>
      </div>
  
      {/* Eye icon toggle for visibility */}
      {showEyeIcon && (
        <button
          className="p-2 hover:bg-gray-500/20 rounded"
          onClick={(e) => {
            e.stopPropagation();
            toggleVisibility(server.id, e);
          }}
        >
          {visibleItems[server.id] ? <FiEye /> : <FiEyeOff />}
        </button>
      )}
  
      {/* Color picker popup */}
      {popupVisible[server.id] && (
        <ColorPicker 
          item={server.id} 
          colors={colorOptions} 
          onSelectColor={changeColor} 
        />
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/servers/${activeServer.id}/users`, {
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
  }, [activeServer]);

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
     
    setServerColors((prevColors) => ({
      ...prevColors,
      [item]: color,
      
    }));
  
   
    if (onColorChange) {
      onColorChange(item, color);  
    }
  
    
    togglePopup(item);
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

  const savePreferences = async (preferences) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile/preferences`, {
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
  );
  
  return (
      <div className={`flex-1 overflow-y-auto time-grid-container ${darkMode ? 'dark-scrollbar' : ''} relative`}>
      <style>{scrollbarStyles}</style>
    
      {/* Conditionally render My Calendars and Other Calendars if no active server */}
      {!activeServer ? (
        <>
          <div className="space-y-2">
            <div
              className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-500/10 transition-colors duration-200"
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
          <div className="space-y-2">
            {/* Servers Dropdown */}
            <div
              className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-500/10 transition-colors duration-200"
              onClick={() => setShowServers(!showServers)}
            >
              <h3 className="font-medium">Servers</h3>
              {showServers ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {showServers && (
              <div className="space-y-1 pl-2">
                {servers.map((server) => renderServerItem(server))}
                
              </div>
            )}
          </div>
        </>
      ) : (
      <div className="space-y-2">
        <div
          className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-500/10 transition-colors duration-200"
          onClick={() => setShowUsers(!showUsers)}
        >
          <h3 className="font-medium">Users</h3>
          {showUsers ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {showUsers && (
          <div className="space-y-1 pl-2">
            {serverUsers.map(user => renderCalendarItem(user.email, user.username, itemColors?.email || 'bg-blue-500'))}
          </div>
        )}
      </div>
      )}
      {/* Other Calendars Section */}
      <div className="space-y-2">
        <div
          className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-500/10 transition-colors duration-200"
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
            {renderCalendarItem('holidays', 'Holidays in United States', itemColors?.holidays || 'bg-yellow-500')}
          </div>
        )}
      </div>
      {showImportPopup && <CalendarPopup onClose={() => setShowImportPopup(false)} />}
    </div>
  );
};

export default CalendarFilter;
