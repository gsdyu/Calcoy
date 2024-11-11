'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navigation/Navbar';
import FriendItem from '@/components/Friends/FriendItem';
import FriendCalendar from '@/components/Friends/FriendCalendar'; // Component for displaying friend's calendar
import { fetchFriends as apiFetchFriends } from '@/utils/api';

const FriendPage = () => {
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null); // Tracks selected friend for calendar view
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Friends');
  const [searchTerm, setSearchTerm] = useState(''); // State to track the search term

  // Load friends from localStorage on component mount
  useEffect(() => {
    const savedFriends = localStorage.getItem('friends');
    if (savedFriends) {
      setFriends(JSON.parse(savedFriends));
    } else {
      // Optionally fetch friends from an API if not in localStorage
      apiFetchFriends()
        .then((data) => setFriends(data))
        .catch((error) => console.error('Error fetching friends:', error));
    }
  }, []);

  // Save friends to localStorage whenever the friends list changes
  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  // Function to add a new friend
  const handleAddFriend = () => {
    if (newFriend.trim()) {
      const updatedFriends = [...friends, { id: Date.now(), name: newFriend }];
      setFriends(updatedFriends);
      setNewFriend('');
    }
  };

  // Function to view a friend's calendar
  const onViewCalendar = (friend) => {
    setSelectedFriend(friend); // Set the selected friend to view their calendar
  };

  // Function to go back to the friends list
  const onBackToFriendsList = () => {
    setSelectedFriend(null); // Reset selected friend to go back to the list
  };

  // Function to handle "Create Server" action in the friend's calendar view
  const handleCreateServer = () => {
    console.log(`Creating server for ${selectedFriend.name}'s calendar`);
    // Logic to create and add a "server" button in the sidebar or related functionality
  };

  // Function to remove a friend
  const onRemoveFriend = (friendId) => {
    const updatedFriends = friends.filter(friend => friend.id !== friendId);
    setFriends(updatedFriends);
  };

  // Filter friends based on the search term
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      {/* Navbar with collapsing feature */}
      <Navbar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />
      <div className={`flex-grow p-6 ${isCollapsed ? 'ml-14' : 'ml-60'} transition-all duration-300`}>
        <h1 className="text-2xl font-bold mb-4">My Friends</h1>

        {/* Toggle between Friends List and Friend's Calendar View */}
        {selectedFriend ? (
          // Friend's Calendar View
          <FriendCalendar 
            friend={selectedFriend} 
            onBack={onBackToFriendsList} 
            onCreateServer={handleCreateServer} 
          />
        ) : (
          <>
            {/* Add Friend Section */}
            <div className="mb-4 flex items-center">
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

            {/* Search Friend Section */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search friends"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-2 py-1 rounded w-full"
              />
            </div>

            {/* Friends List */}
            <ul className="mb-6">
              {filteredFriends.map((friend) => (
                <FriendItem 
                  key={friend.id} 
                  friend={friend} 
                  onViewCalendar={() => onViewCalendar(friend)} // Pass onViewCalendar handler
                  onRemoveFriend={onRemoveFriend} // Pass onRemoveFriend handler
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default FriendPage;
