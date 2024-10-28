// frontend/src/components/Sidebar/FriendList.js
import React, { useState, useEffect } from 'react';

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  
  useEffect(() => {
    // Fetch friends from the API (based on the selected group)
    fetch('/api/servers/friends') // Replace with your backend route
      .then((res) => res.json())
      .then((data) => setFriends(data))
      .catch((error) => console.error('Error fetching friends:', error));
  }, []);

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">Friends</h3>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id} className="mb-2 flex items-center">
            <span className={`status-indicator ${friend.online ? 'bg-green-500' : 'bg-red-500'} rounded-full h-3 w-3 mr-2`}></span>
            {friend.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendList;
