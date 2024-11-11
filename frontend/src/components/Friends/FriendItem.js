import React, { useState } from 'react';
import MessageModal from './MessageModal';
import { FiSettings } from 'react-icons/fi';

const FriendItem = ({ friend, onRemoveFriend, onViewCalendar }) => {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Toggle the message modal visibility
  const handleSendMessage = () => setShowMessageModal(true);

  // Toggle the settings dropdown
  const toggleSettings = () => setShowSettings(prev => !prev);

  // Mock function to share an event
  const handleShareEvent = () => {
    console.log(`Event shared with ${friend.name}`);
  };

  return (
    <div className="friend-item flex items-center justify-between p-4 border rounded-md mb-4 relative">
      <div className="flex items-center">
        <div
          className={`status-indicator ${
            friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          } rounded-full w-3 h-3 mr-2`}
        />
        <span className="font-semibold">{friend.name}</span>
      </div>
      
      <div className="actions flex space-x-2 items-center">
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Message
        </button>
        <button
          onClick={handleShareEvent}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Share Event
        </button>
        <button
          onClick={() => onViewCalendar(friend)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          View Calendar
        </button>

        {/* Settings Button */}
        <button onClick={toggleSettings} className="text-gray-500 hover:text-gray-700 relative">
          <FiSettings size={20} />
        </button>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="absolute top-10 right-0 bg-white shadow-md rounded-md p-2 w-32 z-10">
            <button
              onClick={() => {
                onRemoveFriend(friend.id);
                setShowSettings(false); // Close dropdown after removing
              }}
              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
            >
              Remove Friend
            </button>
          </div>
        )}
      </div>

      {showMessageModal && (
        <MessageModal friend={friend} onClose={() => setShowMessageModal(false)} />
      )}
    </div>
  );
};

export default FriendItem;
