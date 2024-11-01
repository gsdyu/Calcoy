'use client';

 import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useState, useEffect } from 'react';

const CreateCalendarModal = ({ onClose, setServers, setIcon, setIconPreview}) => {
  const { darkMode } = useTheme();
  const [currentTab, setCurrentTab] = useState('main'); // 'main', 'invite', 'link, 'server'
  const [userId, setUserId] = useState(null); 
   // State for the invite link
  const [inviteLink, setInviteLink] = useState('');
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [eventDisplayOption, setEventDisplayOption] = useState('dont_show'); // Default option

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
      } finally {
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
      console.error("User ID is missing");
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
  
      // Call handleNewServer with the new server data including image_url
      setServers((prevServers) => [...prevServers, data.server]);

      // Open event display options popup
      setShowEventPopup(true);

    } catch (error) {
      console.error('Error submitting server info:', error);
    }
  };
  const handleEventOptionSelect = (option) => {
    setEventDisplayOption(option);  
    setShowEventPopup(false); 
    if (onClose) onClose();
    };

  const handleJoinServer = () => {
    if (!inviteLink) {
      alert('Please enter a valid invite link to join a server.');
      return;
    }
    console.log('Joining server with invite link:', inviteLink);
    // Ensure onClose is a function before calling it
    if (typeof onClose === 'function') {
      onClose(); // Close modal after joining server
    } else {
      console.warn('onClose is not defined or not a function.');
    }
  };
 
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-6 rounded-lg w-96`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {currentTab === 'main' ? 'Create a Calendar' : currentTab === 'invite' ? 'Invite My Friends' : 'Tell Us About The Calendar'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
      
        {currentTab === 'main' && (
          <div className="space-y-4">
            <button
              onClick={() => setCurrentTab('invite')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Invite My Friends
            </button>
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


        {currentTab === 'invite' && (
          <form>
            <input
              type="text"
              placeholder="Invite Link"
              value={inviteLink}
              onChange={handleInviteLinkChange}
              className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
              required
            />
            {/* Back Button */}
            <div className="flex justify-between">
              <button type="button" onClick={() => setCurrentTab('main')} className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded">
                Back
              </button>

              
              <button type="button" onClick={handleGenerateInviteLink} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Generate Invite Link
              </button>
            </div>
            <div className="mt-4">
              <br></br>
              {/* New sharing options for generated link with icons */}
              <h1 className="mt-4 text-lg font-semibold">Share With Your Friends</h1>
              <div className="flex space-x-4 mt-2">

                {/* Copy Link Button */}
                <button
                  onClick={() => navigator.clipboard.writeText(inviteLink)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 flex items-center"
                >
                  🔗 
                </button>

                {/* Text Message Button */}
                <button
                  onClick={() => window.open(`sms:?body=${inviteLink}`, '_self')}
                  className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500 flex items-center"
                >
                  💭 
                </button>

                {/* Email Button */}
                <button
                  onClick={() => window.open(`mailto:?subject=Join my calendar&body=${inviteLink}`, '_self')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  📧 
                </button>

                {/* Instagram Button */}
                <button
                  onClick={() => window.open(`https://www.instagram.com/share?url=${inviteLink}`, '_blank')}
                  className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 flex items-center"
                >
                  {/* Instagram logo SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 19 24">
                    <path d="M7.75 2h8.5a5.75 5.75 0 015.75 5.75v8.5a5.75 5.75 0 01-5.75 5.75h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm8.5 1.5h-8.5a4.25 4.25 0 00-4.25 4.25v8.5a4.25 4.25 0 004.25 4.25h8.5a4.25 4.25 0 004.25-4.25v-8.5a4.25 4.25 0 00-4.25-4.25zM12 6.75a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm4.5-.25a.75.75 0 110 1.5.75.75 0 010-1.5z" />
                  </svg>
                  
                </button>

                {/* Discord Button */}
                <button
                  onClick={() => window.open(`https://discord.com/share?url=${inviteLink}`, '_blank')}
                  className="px-4 py-2 bg-purple-400 text-white rounded hover:bg-purple-500 flex items-center"
                >
                  {/* Discord logo SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.72 4.76a19.94 19.94 0 00-5.25-1.7.07.07 0 00-.08.03c-.22.39-.46.9-.63 1.3a17.31 17.31 0 00-5.27 0 12.76 12.76 0 00-.65-1.3.06.06 0 00-.08-.03 20.1 20.1 0 00-5.26 1.7.06.06 0 00-.02.02C1.27 9.27.82 13.55 1.2 17.74a.06.06 0 00.02.02 20.23 20.23 0 005.33 1.68.06.06 0 00.07-.02 14.36 14.36 0 001.28-2.1.06.06 0 00-.03-.08 14.47 14.47 0 01-2.06-1.16.07.07 0 01-.02-.09.05.05 0 01.02-.02c.14-.1.28-.2.41-.3a.06.06 0 01.07 0c4.02 2.9 8.47 2.9 12.45 0a.06.06 0 01.08 0c.13.1.27.2.41.3a.05.05 0 01.02.02.06.06 0 01-.02.09 15.22 15.22 0 01-2.06 1.16.06.06 0 00-.03.08c.38.74.86 1.44 1.28 2.1a.06.06 0 00.07.02 20.36 20.36 0 005.32-1.68.05.05 0 00.02-.02c.42-4.36-.33-8.58-2.76-12.96a.06.06 0 00-.02-.02z" />
                  </svg>
                  
                </button>
              </div>
            </div>
          </form>
        )}  

        {currentTab === 'join' && (
          <form onSubmit={handleSubmitServerInfo}>
            {/* Updated placeholder for server name */}
            <input
              type="text"
              name="serverName"
              placeholder="https://timewise.com/invite/es167y6o" // NEW placeholder for server invite link
              value={serverInfo.serverName}
              onChange={handleServerChange}
              className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-400 border-gray-500'} border rounded`}
              required
            />
            {/* Added example invite links below input */}
            <div className="text-sm text-gray-500 mb-4">
              <span className="block mb-2 font-semibold">Invites Should Look Like This:</span> {/* Label for example invites */}
              <div>https://timewise.com/invite/es589y9v</div>
              <div>https://timewise.com/invite/es323y6c</div>
              <div>https://timewise.com/invite/es945y8h</div>
            </div>
         
            <div className="flex justify-between">
              <button type="button" onClick={() => setCurrentTab('main')} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">
                Back
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Join Calendar {/* Renamed submit button */}
              </button>
            </div>
    
          </form>
        )}
        {currentTab === 'server' && (
          <form onSubmit={handleSubmitServerInfo}>
            <p className="text-center mb-4">Give your new server a personality with a name and an icon. You can always change it later.</p>
            <div className="flex flex-col items-center mb-4">
              {/* Updated to show preview if iconPreview exists */}
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

        {/* Popup for Event Options */}
        {showEventPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-4 rounded-lg w-80`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Select Event Display Option</h3>
                <button onClick={() => handleEventOptionSelect('dont_show')} className="text-gray-400 hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">Choose how events from your personal calendar appear in this new server:</p>
              <button
                onClick={() => handleEventOptionSelect('dont_show')}
                className="w-full px-4 py-2 mb-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Don’t Show Events
              </button>
              <button
                onClick={() => handleEventOptionSelect('limited')}
                className="w-full px-4 py-2 mb-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Show Limited Events
              </button>
              <button
                onClick={() => handleEventOptionSelect('full')}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Show Full Events
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
      );
    };
 
 
 

// added by seore 10/23/24
const handleSubmitServerInfo = async (e) => {
  e.preventDefault();

  try {
      // Make an API call to create the group
      const response = await fetch('/api/groups/create', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(serverInfo), // Send server info (name, description, etc.)
      });

      const data = await response.json();
      if (response.ok) {
          console.log('Server info submitted:', serverInfo);
          // Redirect the user to the shared calendar page of the new group
          window.location.href = `/shared-calendar/${data.groupId}`;
      } else {
          console.error('Error creating group:', data.error);
      }

      if (onClose) onClose(); // Close modal after submitting server info & safely calls onClose if provided
  } catch (error) {
      console.error('Error submitting server info:', error);
  }
};

export default CreateCalendarModal;