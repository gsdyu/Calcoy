import React, { useState, useEffect } from 'react';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Fetch friends from API or state (mocked here for example)
  useEffect(() => {
    setFriends([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]);
  }, []);

  // Handle adding a new friend
  const handleAddFriend = () => {
    if (newFriend.trim()) {
      setFriends([...friends, { id: Date.now(), name: newFriend }]);
      setNewFriend('');
    }
  };

  // Handle selecting a friend to view their calendar
  const handleViewCalendar = (friend) => {
    setSelectedFriend(friend);
    // Here, you'd load or route to the friend's calendar data
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Friends</h1>

      {/* Add Friend Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Enter friend's name"
          value={newFriend}
          onChange={(e) => setNewFriend(e.target.value)}
          className="border px-2 py-1 rounded mr-2"
        />
        <button onClick={handleAddFriend} className="bg-blue-500 text-white px-3 py-1 rounded">
          Add Friend
        </button>
      </div>

      {/* Friends List Section */}
      <ul className="mb-6">
        {friends.map((friend) => (
          <li key={friend.id} className="flex justify-between items-center border-b py-2">
            <span>{friend.name}</span>
            <button
              onClick={() => handleViewCalendar(friend)}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              View Calendar
            </button>
          </li>
        ))}
      </ul>

      {/* Selected Friend's Calendar Section */}
      {selectedFriend && (
        <div>
          <h2 className="text-xl font-semibold mb-3">{selectedFriend.name}'s Calendar</h2>
          {/* Placeholder for friend's calendar component */}
          <p>This is where {selectedFriend.name}'s calendar would display.</p>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
