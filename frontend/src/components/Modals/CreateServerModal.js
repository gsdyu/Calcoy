import React, { useState } from 'react';
import { useRouter } from 'next/router'; // Use Next.js router for navigation

const handleCreateServer = () => {
  if (serverName.trim()) {
    // Logic to create a new server (e.g., calling backend API to save server data)
    console.log('Server created:', serverName);

    // Use router to navigate to the shared calendar page after server creation
    router.push(`/shared-calendar?server=${serverName}`);
  }
};

const CreateServerModal = ({ onClose }) => {
  const [serverName, setServerName] = useState('');

  const handleCreateServer = () => {
    if (serverName.trim()) {
      // Logic to create a new server (e.g., call backend API)
      console.log('Server created:', serverName);
      onClose();
    }
  };

  return (
    <div className="modal bg-white p-4 rounded shadow-lg">
      <h2>Create a New Server</h2>
      <input
        type="text"
        value={serverName}
        onChange={(e) => setServerName(e.target.value)}
        placeholder="Enter server name"
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleCreateServer}
        className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
      >
        Create Server
      </button>
      <button onClick={onClose} className="text-gray-500 mt-2">Cancel</button>
    </div>
  );
};

export default CreateServerModal;
