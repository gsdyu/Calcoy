'use client';

import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Calendar, X, ArrowLeft, Users } from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import FriendCalendar from '@/components/Friends/FriendCalendar';
import { fetchFriends as apiFetchFriends } from '@/utils/api';
import { useTheme } from '@/contexts/ThemeContext';
import NotificationSnackbar from '@/components/Modals/NotificationSnackbar';

const FriendPage = () => {
  const { darkMode } = useTheme();
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ 
    message: '', 
    action: '', 
    isVisible: false 
  });

  useEffect(() => {
    const savedFriends = localStorage.getItem('friends');
    if (savedFriends) {
      setFriends(JSON.parse(savedFriends));
    } else {
      apiFetchFriends()
        .then((data) => {
          setFriends(data);
          showNotification('Friends loaded successfully');
        })
        .catch((error) => {
          console.error('Error fetching friends:', error);
          showNotification('Failed to load friends');
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  const showNotification = (message) => {
    setNotification({ message, action: '', isVisible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const handleAddFriend = () => {
    if (newFriend.trim()) {
      try {
        showNotification('Adding friend...');
        const updatedFriends = [...friends, { id: Date.now(), name: newFriend }];
        setFriends(updatedFriends);
        setNewFriend('');
        showNotification('Friend added successfully');
      } catch (error) {
        console.error('Error adding friend:', error);
        showNotification('Failed to add friend');
      }
    }
  };

  const onViewCalendar = (friend) => {
    setSelectedFriend(friend);
    showNotification(`Viewing ${friend.name}'s calendar`);
  };

  const onBackToFriendsList = () => {
    setSelectedFriend(null);
    showNotification('Returned to friends list');
  };

  const handleCreateServer = () => {
    console.log(`Creating server for ${selectedFriend.name}'s calendar`);
    showNotification('Creating calendar server...');
  };

  const onRemoveFriend = (friendId) => {
    try {
      showNotification('Removing friend...');
      const friend = friends.find(f => f.id === friendId);
      const updatedFriends = friends.filter(friend => friend.id !== friendId);
      setFriends(updatedFriends);
      showNotification(`${friend.name} removed from friends`);
    } catch (error) {
      console.error('Error removing friend:', error);
      showNotification('Failed to remove friend');
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <Navbar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />
      
      <div className={`flex-grow ${isCollapsed ? 'ml-14' : 'ml-60'} transition-all duration-300 
        ${darkMode ? 'bg-[#0B0F17]' : 'bg-white'}`}>
        
        <div className="h-full p-8">
          {selectedFriend ? (
            <div className="h-full">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={onBackToFriendsList}
                  className={`p-2 rounded-full transition-colors
                    ${darkMode 
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'}`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {selectedFriend.name}'s Calendar
                </h1>
              </div>
              <FriendCalendar 
                friend={selectedFriend} 
                onBack={onBackToFriendsList} 
                onCreateServer={handleCreateServer} 
              />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                  My Friends <Users className="w-6 h-6 text-purple-400" />
                </h1>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4
                    ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-full w-64 text-sm focus:outline-none focus:ring-2 
                      focus:ring-purple-500/50 transition-colors
                      ${darkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400' 
                        : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500'} 
                      border`}
                  />
                </div>
              </div>

              <div className={`relative p-6 rounded-2xl border
                ${darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'}`}>
                <div className="relative">
                  <h2 className={`text-xl font-semibold mb-4
                    ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Add New Friend
                  </h2>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter friend's name"
                      value={newFriend}
                      onChange={(e) => setNewFriend(e.target.value)}
                      className={`flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 
                        focus:ring-purple-500/50 transition-colors
                        ${darkMode 
                          ? 'bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`}
                    />
                    <button
                      onClick={handleAddFriend}
                      disabled={!newFriend.trim()}
                      className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 
                        hover:from-blue-600 hover:to-purple-600 text-white font-medium flex items-center gap-2 
                        disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Friend
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`group p-4 rounded-2xl border transition-all duration-200
                      ${darkMode 
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 
                          flex items-center justify-center text-white font-bold">
                          {friend.name[0].toUpperCase()}
                        </div>
                        <span className={`font-medium
                          ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {friend.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onViewCalendar(friend)}
                          className={`p-2 rounded-full transition-colors
                            ${darkMode 
                              ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'}`}
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onRemoveFriend(friend.id)}
                          className={`p-2 rounded-full transition-colors
                            ${darkMode 
                              ? 'hover:bg-red-900/20 text-gray-400 hover:text-red-400' 
                              : 'hover:bg-red-100 text-gray-500 hover:text-red-600'}`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredFriends.length === 0 && (
                  <div className={`text-center py-12 
                    ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm ? 'No friends found matching your search' : 'No friends added yet'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <NotificationSnackbar
          message={notification.message}
          isVisible={notification.isVisible}
        />
      </div>
    </div>
  );
};

export default FriendPage;