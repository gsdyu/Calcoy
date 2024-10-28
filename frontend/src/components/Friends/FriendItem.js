import React, { useState } from 'react';
import MessageModal from './MessageModal';

const FriendItem = ({ friend }) => {
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Toggle the message modal visibility
  const handleSendMessage = () => setShowMessageModal(true);

  // Mock function to share an event
  const handleShareEvent = () => {
    console.log(`Event shared with ${friend.name}`);
  };

  return (
    <div className="friend-item flex items-center justify-between p-4 border rounded-md mb-4">
      <div className="flex items-center">
        <div
          className={`status-indicator ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full w-3 h-3 mr-2`}
        />
        <span className="font-semibold">{friend.name}</span>
      </div>
      <div className="actions flex space-x-2">
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
      </div>
      {showMessageModal && (
        <MessageModal friend={friend} onClose={() => setShowMessageModal(false)} />
      )}
    </div>
  );
};

export default FriendItem;
