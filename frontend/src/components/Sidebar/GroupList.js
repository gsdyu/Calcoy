import React, { useState, useEffect } from 'react';

const GroupList = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch groups from the API
    fetch('/api/servers')
      .then((res) => res.json())
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching groups:', error);
        setLoading(false);
      });
  }, []);

  const handleJoinServer = async (group) => {
    try {
      const response = await fetch('/api/servers/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: group.id, userId: 1 }) // Replace with actual user ID
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error joining server:', error);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">Groups</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group.id} className="mb-2">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => onGroupSelect(group)}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md text-left w-full"
                >
                  {group.name} ({group.visibility})
                </button>
                {group.visibility === 'private' ? (
                  <button
                    onClick={() => handleJoinServer(group)}
                    className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                  >
                    Request Join
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinServer(group)}
                    className="bg-green-500 text-white px-2 py-1 rounded ml-2"
                  >
                    Join
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupList;
