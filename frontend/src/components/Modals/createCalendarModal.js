
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const CreateCalendarModal = ({ onClose }) => {
  const { darkMode } = useTheme();
  const [currentTab, setCurrentTab] = useState('main'); // 'main', 'invite', 'server'

  // State for server info
  const [serverInfo, setServerInfo] = useState({
    serverName: '',
    description: ''
  });

  // State for inviting friends
  const [inviteInfo, setInviteInfo] = useState({
    email: '',
    phoneNumber: ''
  });

  const handleServerChange = (e) => {
    const { name, value } = e.target;
    setServerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitServerInfo = (e) => {
    e.preventDefault();
    console.log('Server info submitted:', serverInfo);
    onClose(); // Close modal after submitting server info
  };

  const handleSubmitInviteInfo = (e) => {
    e.preventDefault();
    console.log('Invite info submitted:', inviteInfo);
    onClose(); // Close modal after submitting invite info
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-6 rounded-lg w-96`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {currentTab === 'main' ? 'Create a Calendar' : currentTab === 'invite' ? 'Invite My Friends' : 'Tell Us About The Server'}
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
              onClick={() => setCurrentTab('server')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Tell Us About The Server
            </button>
          </div>
        )}

        {currentTab === 'invite' && (
          <form onSubmit={handleSubmitInviteInfo}>
            <input
              type="email"
              name="email"
              placeholder="Friend's Email"
              value={inviteInfo.email}
              onChange={handleInviteChange}
              className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Friend's Phone Number"
              value={inviteInfo.phoneNumber}
              onChange={handleInviteChange}
              className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
            />
            <div className="flex justify-between">
              <button type="button" onClick={() => setCurrentTab('main')} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
                Back
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Generate Invite Link
              </button>
            </div>
          </form>
        )}

        {currentTab === 'server' && (
          <form onSubmit={handleSubmitServerInfo}>
            <input
              type="text"
              name="serverName"
              placeholder="Server Name"
              value={serverInfo.serverName}
              onChange={handleServerChange}
              className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={serverInfo.description}
              onChange={handleServerChange}
              className={`w-full p-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border rounded`}
              required
            />
            <div className="flex justify-between">
              <button type="button" onClick={() => setCurrentTab('main')} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
                Back
              </button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateCalendarModal;
