// src/components/Friends/FriendCalendar.js
import React from 'react';

const FriendCalendar = ({ friend, onBack, onCreateServer }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{friend.name}'s Calendar</h2>
      <button onClick={onBack} className="mb-4 text-blue-500 underline">
        Back to Friends List
      </button>
      <p>This is where {friend.name}'s calendar would be displayed.</p>

      {/* Create Server Button */}
      <button onClick={onCreateServer} className="mt-4 px-4 py-2 bg-purple-500 text-white rounded">
        Create Server
      </button>
    </div>
  );
};

export default FriendCalendar;
