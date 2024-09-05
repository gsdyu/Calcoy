'use client';

import React, { useState } from 'react';
import Navbar from './Navigation/Navbar';
import AddEventModal from './Modals/AddEditEventModal';
import { useTheme } from '@/contexts/ThemeContext';

const SharedLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const { darkMode } = useTheme();

  const handleAddEvent = () => {
    setIsAddingEvent(true);
  };

  const handleCloseModal = () => {
    setIsAddingEvent(false);
  };

  const handleSaveEvent = (event) => {
    console.log('Saving event:', event);
    setIsAddingEvent(false);
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
        <AddEventModal 
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
};

export default SharedLayout;