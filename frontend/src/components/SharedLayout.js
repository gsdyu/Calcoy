'use client';

import React, { useState } from 'react';
import Navbar from './Navigation/Navbar';
import AddEditEventModal from './Modals/AddEditEventModal';
import NotificationSnackbar from './Modals/NotificationSnackbar';
import { useTheme } from '@/contexts/ThemeContext';

const SharedLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    action: '',
    isVisible: false
  });
  const { darkMode } = useTheme();

  const showNotification = (message, type = 'success', action = '') => {
    setNotification({ message, type, action, isVisible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 4000);
  };

  const handleAddEvent = () => {
    setIsAddingEvent(true);
  };

  const handleCloseModal = () => {
    setIsAddingEvent(false);
  };

  const handleSaveEvent = async (event) => {
    try {
      const check = await fetch('http://localhost:5000/auth/check', {
        credentials: 'include',
      });
      if (!check.ok) {
        showNotification('Authentication required', 'error');
        return;
      }

      const isTask = event.calendar === 'Task';
      showNotification(`Saving ${isTask ? 'task' : 'event'}...`, 'info');
      
      const response = await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...event,
          include_in_personal: event.include_in_personal ?? true,
        }),
      });

      if (response.ok) {
        const savedEvent = await response.json();
        setIsAddingEvent(false);
        showNotification(
          `${isTask ? 'Task' : 'Event'} saved successfully`, 
          'success',
          'Undo'
        );
      } else {
        throw new Error(`Failed to save ${isTask ? 'task' : 'event'}`);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      showNotification(
        `Failed to save ${event?.calendar === 'Task' ? 'task' : 'event'}`, 
        'error'
      );
    }
  };

  return (
    <div className={`flex h-screen w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <Navbar 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        onAddEvent={handleAddEvent}
      />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-14' : 'ml-60'}`}>
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
      {isAddingEvent && (
        <AddEditEventModal 
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          initialDate={new Date()}
          event={null}
        />
      )}
      <NotificationSnackbar
        message={notification.message}
        type={notification.type}
        action={notification.action}
        isVisible={notification.isVisible}
        position="bottom"
      />
    </div>
  );
};

export default SharedLayout;