'use client';

import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import EventOptionsPopup from '@/components/Modals/EventOptionsPopup';

const CreateCalendarModal = ({ onClose, setServers, setIcon, setIconPreview}) => {
  const { darkMode } = useTheme();
  const [currentTab, setCurrentTab] = useState('main'); 
  const [userId, setUserId] = useState(null); 
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [eventDisplayOption, setEventDisplayOption] = useState('dont_show');

  // State for server info
  const [serverInfo, setServerInfo] = useState({
    serverName: '',
    description: '',
    icon: null,
    iconPreview: null 
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch user ID');
        
        const data = await response.json();
        setUserId(data.userId);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };
    fetchUserId();
  }, []);

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    setServerInfo(prev => ({
      ...prev,
      icon: file,
      iconPreview: file ? URL.createObjectURL(file) : null  
    }));
    setIcon(file);  
    setIconPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleServerChange = (e) => {
    const { name, value } = e.target;
    setServerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitServerInfo = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('serverName', serverInfo.serverName);
    formData.append('userId', userId);
    if (serverInfo.icon) formData.append('icon', serverInfo.icon);
  
    if (!userId) {
      console.error('User ID is missing');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/servers/create', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
  
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response from server:', text);
        return;
      }
  
      const data = await response.json();
      console.log('Server created:', data.server);
  
      // Store the new server ID
      setServerInfo((prevInfo) => ({ ...prevInfo, serverId: data.server.id }));
  
      // Add the new server to the server list
      setServers((prevServers) => [...prevServers, data.server]);
  
      // Open the event display options popup
      setShowEventPopup(true);
    } catch (error) {
      console.error('Error submitting server info:', error);
    }
  };
 
  const handleEventOptionSelect = async (option) => {
    setEventDisplayOption(option);
    setShowEventPopup(false);

    // Use the newly created server ID for importing events
    const newServerId = serverInfo.serverId;

    if (option !== 'dont_show') {
      try {
        const response = await fetch('http://localhost:5000/events/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            server_id: newServerId,
            displayOption: option,
          }),
        });

        if (response.ok) {
          console.log('Events imported successfully');
        } else {
          console.error('Failed to import events');
        }
      } catch (error) {
        console.error('Error importing events:', error);
      }
    }

    if (onClose) onClose();
  };

  const handleJoinServer = () => {
    if (!serverInfo.serverName) {
      alert('Please enter a valid invite link to join a server.');
      return;
    }
    console.log('Joining server with invite link:', serverInfo.serverName);
    if (typeof onClose === 'function') {
      onClose();
    } else {
      console.warn('onClose is not defined or not a function.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-6 rounded-lg w-96`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {currentTab === 'main' ? 'Create a Calendar' : currentTab === 'join' ? 'Join A Server' : 'Tell Us About The Calendar'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
      
        {currentTab === 'main' && (
          <div className="space-y-4">
            <button
              onClick={() => setCurrentTab('join')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Join A Server
            </button>
            <button
              onClick={() => setCurrentTab('server')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Create a Server
            </button>
          </div>
        )}

        {currentTab === 'join' && (
          <form onSubmit={handleSubmitServerInfo}>
            <input
              type="text"
              name="serverName"
              placeholder="https://timewise.com/invite/es167y6o"
              value={serverInfo.serverName}
              onChange={handleServerChange}
              className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-400 border-gray-500'} border rounded`}
              required
            />
            <div className="text-sm text-gray-500 mb-4">
              <span className="block mb-2 font-semibold">Invites Should Look Like This:</span>
              <div>https://timewise.com/invite/es589y9v</div>
              <div>https://timewise.com/invite/es323y6c</div>
              <div>https://timewise.com/invite/es945y8h</div>
            </div>
         
            <div className="flex justify-between">
              <button type="button" onClick={() => setCurrentTab('main')} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">
                Back
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Join Calendar
              </button>
            </div>
          </form>
        )}

        {currentTab === 'server' && (
          <form onSubmit={handleSubmitServerInfo}>
            <p className="text-center mb-4">Give your new server a personality with a name and an icon. You can always change it later.</p>
            <div className="flex flex-col items-center mb-4">
              <label className="w-20 h-20 bg-gray-500 rounded-full flex items-center justify-center cursor-pointer mb-2 relative overflow-hidden">
                <input type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
                {serverInfo.iconPreview ? (
                  <img src={serverInfo.iconPreview} alt="Icon preview" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-white">UPLOAD</span>
                )}
              </label>
            </div>
            <label htmlFor="serverName" className="block text-gray-400 mb-1">SERVER NAME</label>
            <input
              type="text"
              id="serverName"
              name="serverName"
              placeholder="Enter server name"
              value={serverInfo.serverName}
              onChange={handleServerChange}
              className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
              required
            />
            <div className="text-xs text-gray-500 mb-4">
              By creating a server, you agree to Timewise's Community Guidelines.
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setCurrentTab('main')} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">
                Back
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Create
              </button>
            </div>
          </form>
        )}

        <EventOptionsPopup 
          showEventPopup={showEventPopup}
          darkMode={darkMode}
          handleEventOptionSelect={handleEventOptionSelect}
        />
      </div>
    </div>
  );
};

export default CreateCalendarModal;