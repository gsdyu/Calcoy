'use client';

import { X, Plus, Users, CalendarPlus } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import EventOptionsPopup from '@/components/Modals/EventOptionsPopup';

const CreateCalendarModal = ({ onClose, setServers, setIcon, setIconPreview}) => {
  const { darkMode } = useTheme();
  const [currentTab, setCurrentTab] = useState('main'); 
  const [userId, setUserId] = useState(null); 
  const [inviteLink, setInviteLink] = useState('');
  const [showEventPopup, setShowEventPopup, handleInviteLinkChange] = useState(false);
  const [eventDisplayOption, setEventDisplayOption] = useState('dont_show');

  const [serverInfo, setServerInfo] = useState({
    serverName: '',
    description: '',
    icon: null,
    iconPreview: null 
  });

  const handleClickOutside = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user`, {
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

  const handleIconChange = async (e) => {
    const file = e.target.files[0];
  
    if (file) {
      // Convert file to Base64
      const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
  
      try {
        const base64Image = await toBase64(file);
  
        // Update server info and state
        setServerInfo((prev) => ({
          ...prev,
          icon: file,
          iconPreview: URL.createObjectURL(file),
          imageBase64: base64Image,
        }));
      } catch (error) {
        console.error("Failed to convert file to base64:", error);
      }
  
      setIcon(file);
      setIconPreview(URL.createObjectURL(file));
    } else {
      // If no file is selected, clear the state
      setServerInfo((prev) => ({
        ...prev,
        icon: null,
        iconPreview: null,
        imageBase64: null,
      }));
      setIcon(null);
      setIconPreview(null);
    }
  };
  

  const handleServerChange = (e) => {
    const { name, value } = e.target;
    setServerInfo(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmitServerInfo = async (e) => {
    e.preventDefault();

    if (!serverInfo.serverName || !userId) {
        console.error('Missing serverName or userId');
        return;
    }

    try {
        const base64SizeMB = serverInfo.imageBase64
            ? (serverInfo.imageBase64.length * 3) / 4 / (1024 * 1024)
            : 0;

        if (base64SizeMB > 4) {
            alert('The image is too large. Please use a smaller image.');
            return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/servers/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                serverName: serverInfo.serverName,
                userId,
                imageBase64: serverInfo.imageBase64 || null, // Include Base64 only if available
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Error response from server:', text);
            return;
        }

        const data = await response.json();
        setServerInfo((prevInfo) => ({ ...prevInfo, serverId: data.server.id }));
        setServers((prevServers) => [...prevServers, data.server]);
        setShowEventPopup(true);
    } catch (error) {
        console.error('Error submitting server info:', error);
    }
};

  
 
  const handleEventOptionSelect = async (option) => {
    setEventDisplayOption(option);
    setShowEventPopup(false);

    const newServerId = serverInfo.serverId;

    if (option !== 'dont_show') {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/events/import`, {
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

        if (!response.ok) {
          console.error('Failed to import events');
        }
      } catch (error) {
        console.error('Error importing events:', error);
      }
    }

    if (onClose) onClose();
  };

const handleJoinServer = async () => {
  if (!inviteLink) {
    alert('Please enter a valid invite link to join a server.');
    return;
  }

  const handleGenerateInviteLink = () => {
    // Generates new invite link for the current calendar
    const newInviteLink = `https://timewise.com/invite/${Math.random().toString(36).substr(2, 8)}`;
    setInviteLink(newInviteLink);
    console.log('Generated new invite link:', newInviteLink);
  };

  // Copy the invite link to clipboard without refreshing
  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
    } else {
      alert('Please generate an invite link first.');
    }
  };

  // Open Instagram
  const handleOpenInstagram = () => {
    window.open('https://www.instagram.com', '_blank');
  };

  // Open Discord
  const handleOpenDiscord = () => {
    window.open('https://discord.com/app', '_blank');
  };


  const formData = new FormData();
  formData.append('inviteLink', inviteLink);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/servers/join`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inviteLink, userId }), // Include inviteLink in JSON
    });
  
    const joinData = await response.json();
  
    if (response.ok) {
      const serverId = joinData.serverId;
  
      if (!serverId) {
        console.error('Server ID not returned from join response:', joinData);
        alert('Failed to retrieve server ID after joining.');
        return;
      }
  
      // Fetch the full server details using the server ID
      const serverResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/servers/${serverId}`, {
        method: 'GET',
        credentials: 'include',
      });
  
      if (serverResponse.ok) {
        const serverData = await serverResponse.json();
        setServers((prevServers) => [...prevServers, serverData]);
        alert('Joined server successfully!');
      } else {
        alert('Failed to load server details after joining.');
      }
    } else {
      // Check for "Already joined" message and handle it as an error
      if (joinData.message === 'Already joined') {
        alert('You have already joined this server.');
      } else {
        console.error('Error response from server:', joinData.error);
        alert(joinData.error || 'Failed to join server');
      }
    }
  } catch (error) {
    console.error('Error joining server:', error);
    alert('Failed to join server');
  }
  
  if (onClose) onClose();
};  


  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 modal-overlay"
      onClick={handleClickOutside}
    >
      <div 
        className={`
          ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}
          w-[480px] rounded-3xl shadow-2xl transform transition-all
          border border-gray-800/10
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-800/10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {currentTab === 'main' ? 'Create a Calendar' : 
               currentTab === 'join' ? 'Join A Server' : 'Create Your Server'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-800/40 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      
        {/* Content */}
        <div className="p-8">
          {currentTab === 'main' && (
            <div className="space-y-4">
              <button
                onClick={() => setCurrentTab('join')}
                className="w-full p-4 rounded-2xl transition-all bg-gradient-to-r from-green-400/10 to-green-500/10 
                  hover:from-green-400/20 hover:to-green-500/20 border border-green-500/20
                  group flex items-center gap-4"
              >
                <div className="p-3 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg text-green-400 mb-1">Join A Server</div>
                  <p className="text-sm text-gray-400">Connect with friends using their invite link</p>
                </div>
              </button>

              <button

                onClick={() => setCurrentTab('server')}
                className="w-full p-4 rounded-2xl transition-all bg-gradient-to-r from-purple-400/10 to-pink-500/10 
                  hover:from-purple-400/20 hover:to-pink-500/20 border border-purple-500/20
                  group flex items-center gap-4"
              >
                <div className="p-3 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <CalendarPlus className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg text-purple-400 mb-1">Create a Server</div>
                  <p className="text-sm text-gray-400">Start a new calendar server for your team</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTab('export')}
                className="w-full p-4 rounded-2xl transition-all bg-gradient-to-r from-red-400/10 to-red-500/10 
                  hover:from-red-400/20 hover:to-red-500/20 border border-red-500/20
                  group flex items-center gap-4"
              >
                <div className="p-3 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                  <Users className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg text-red-400 mb-1">Export your Calendar</div>
                  <p className="text-sm text-gray-400">Export your Calendar as an ICS file</p>
                </div>
              </button>
            </div>
          )}

          {currentTab === 'join' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleJoinServer();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Server Invite Link</label>
                  <input
                    type="text"
                    name="inviteLink"
                    placeholder="https://timewise.com/invite/es167y6o"
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                    className={`
                      w-full p-3 rounded-full transition-all
                      ${darkMode 
                        ? 'bg-gray-800/50 focus:bg-gray-800/70 border-gray-700' 
                        : 'bg-gray-100 border-gray-300'} 
                      border focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    `}
                    required
                  />
                </div>

                <div className="bg-gray-800/30 rounded-2xl p-4">
                  <div className="font-medium text-gray-400 mb-2">Example Invite Links:</div>
                  <div className="space-y-1 text-sm text-gray-500">
                    <div>https://timewise.com/invite/es589y9v</div>
                    <div>https://timewise.com/invite/es323y6c</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button 
                  type="button" 
                  onClick={() => setCurrentTab('main')}
                  className="px-6 py-2 rounded-full border border-gray-700 hover:bg-gray-800/50 transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 
                    hover:from-blue-600 hover:to-blue-700 text-white transition-colors"
                >
                  Join Server
                </button>
              </div>
            </form>
          )}

          {currentTab === 'server' && (
            <form onSubmit={handleSubmitServerInfo} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <label className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer
                    relative overflow-hidden group transition-all duration-300
                    bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20
                    border-2 border-dashed border-gray-700 hover:border-purple-500/50"
                  >
                    <input type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
                    {serverInfo.iconPreview ? (
                      <img src={serverInfo.iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
                    ) : (
                      <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    )}
                  </label>
                </div>
                <p className="text-sm text-gray-400">Upload a server icon</p>
              </div>

              <div>
                <label htmlFor="serverName" className="block text-sm font-medium text-gray-400 mb-2">
                  SERVER NAME
                </label>
                <input
                  type="text"
                  id="serverName"
                  name="serverName"
                  placeholder="Enter server name"
                  value={serverInfo.serverName}
                  onChange={handleServerChange}
                  className={`
                    w-full p-3 rounded-full transition-all
                    ${darkMode 
                      ? 'bg-gray-800/50 focus:bg-gray-800/70 border-gray-700' 
                      : 'bg-gray-100 border-gray-300'} 
                    border focus:outline-none focus:ring-2 focus:ring-purple-500/50
                  `}
                  required
                />
              </div>

              <p className="text-xs text-gray-500">
                By creating a server, you agree to TimeWise's Community Guidelines
              </p>

              <div className="flex justify-between">
                <button 
                  type="button" 
                  onClick={() => setCurrentTab('main')}
                  className="px-6 py-2 rounded-full border border-gray-700 hover:bg-gray-800/50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 
                    hover:from-purple-600 hover:to-pink-700 text-white transition-colors"
                >
                  Create Server
                </button>
              </div>
            </form>
          )}
          {currentTab === 'export' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleJoinServer();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Server Invite Link</label>
                  <input
                    type="text"
                    name="inviteLink"
                    placeholder="https://timewise.com/invite/es167y6o"
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                    className={`
                      w-full p-3 rounded-full transition-all
                      ${darkMode 
                        ? 'bg-gray-800/50 focus:bg-gray-800/70 border-gray-700' 
                        : 'bg-gray-100 border-gray-300'} 
                      border focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    `}
                    required
                  />
                </div>

                <div className="bg-gray-800/30 rounded-2xl p-4">
                  <div className="font-medium text-gray-400 mb-2">Example Invite Links:</div>
                  <div className="space-y-1 text-sm text-gray-500">
                    <div>https://timewise.com/invite/es589y9v</div>
                    <div>https://timewise.com/invite/es323y6c</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button 
                  type="button" 
                  onClick={() => setCurrentTab('main')}
                  className="px-6 py-2 rounded-full border border-gray-700 hover:bg-gray-800/50 transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 
                    hover:from-blue-600 hover:to-blue-700 text-white transition-colors"
                >
                  Join Server
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      <EventOptionsPopup 
        showEventPopup={showEventPopup}
        darkMode={darkMode}
        handleEventOptionSelect={handleEventOptionSelect}
      />
    </div>
  );
};

export default CreateCalendarModal;
