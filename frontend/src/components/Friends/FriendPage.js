// components/FriendPage.js

import React, { useEffect, useState } from 'react';
import FriendItem from '@/components/FriendItem'; // Assuming FriendItem is in the same components folder
import { fetchFriends } from '@/utils/api'; // Assuming the API utility is correctly configured here

const FriendPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch friends list on component mount
  useEffect(() => {
    fetchFriends()
      .then((data) => {
        setFriends(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching friends:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="friends-page p-4">
      <h1 className="text-2xl font-bold mb-4">My Friends</h1>
      {loading ? (
        <p>Loading friends...</p>
      ) : friends.length > 0 ? (
        friends.map((friend) => <FriendItem key={friend.id} friend={friend} />)
      ) : (
        <p>No friends added yet.</p>
      )}
    </div>
  );
};

export default FriendPage;
