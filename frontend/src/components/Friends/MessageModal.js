import React, { useState } from 'react';

const MessageModal = ({ friend, onClose }) => {
  const [message, setMessage] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      //await sendMessage(friend.id, message);
      alert(`Message sent to ${friend.name}`);
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-80">
        <h2 className="text-xl font-bold mb-4">Send Message to {friend.name}</h2>
        <form onSubmit={handleSend}>
          <textarea
            className="w-full border rounded p-2 mb-4"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <div className="flex justify-end space-x-2">
            <button onClick={onClose} type="button" className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Send</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;
