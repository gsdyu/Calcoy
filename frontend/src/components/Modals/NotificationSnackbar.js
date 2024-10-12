import React, { useState, useEffect } from 'react';

const NotificationSnackbar = ({ message, action, onActionClick, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-between z-50">
      <span>{message}</span>
      {action && (
        <button
          onClick={onActionClick}
          className="ml-4 text-blue-400 hover:text-blue-300 focus:outline-none"
        >
          {action}
        </button>
      )}
    </div>
  );
};

export default NotificationSnackbar;