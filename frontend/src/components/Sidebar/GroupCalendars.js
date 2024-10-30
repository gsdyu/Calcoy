'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import CreateCalendarModal from '@/components/Modals/createCalendarModal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GroupCalendars = ({ toggleSidebar, isSidebarOpen, activeCalendar, handleChangeActiveCalendar }) => {
  const { darkMode } = useTheme();
  const [isCreateCalendarOpen, setIsCreateCalendarOpen] = useState(false);
  const [servers, setServers] = useState([]);

  // Fetch servers from the backend
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/servers', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setServers(data.servers);
        } else {
          console.error('Failed to fetch servers');
        }
      } catch (error) {
        console.error('Error fetching servers:', error);
      }
    };

    fetchServers();
  }, []);

  const handleOpenCalendar = () => {
    setIsCreateCalendarOpen(true);
  };

  const handleCloseCreateCalendarModal = () => {
    setIsCreateCalendarOpen(false);
  };

  // Update servers when a new one is created
  const handleNewServer = (newServer) => {
    setServers((prevServers) => [...prevServers, newServer]);
  };

  // Function to get initials from the server name
  const getInitials = (name) => {
    if (!name) return 'S'; // Default to 'S' if no name is provided
    return name.charAt(0).toUpperCase(); // Use the first character of the server name
  };

  return (
    <div className={`w-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} flex flex-col items-center py-4 h-screen relative z-40`}>
      <button 
        onClick={toggleSidebar}
        className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md transition-all duration-300"
      >
        {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="flex-grow flex flex-col items-center space-y-4">
        {/* Main Calendar Button */}
        <button 
          className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center" 
          onClick={() => handleChangeActiveCalendar(null)}
        >
          <Calendar size={24} className="text-white" />
        </button>
        
        {/* Shared Calendar Button */}
        <button 
          onClick={() => handleChangeActiveCalendar(0)} 
          className={`w-12 h-12 rounded-full bg-green-600 flex items-center justify-center ${activeCalendar === 0 ? 'border-2 border-blue-500' : ''}`}
        >
          <Calendar size={24} className="text-white" />
        </button>

        <div className="w-8 h-0.5 bg-gray-600 my-2"></div>

        {/* Servers (Group Calendars) */}
        {servers.map((server) => (
          <button 
            key={server.id} 
            onClick={() => handleChangeActiveCalendar(server.id)} 
            className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center ${activeCalendar === server.id ? 'border-2 border-blue-500' : ''}`}
          >
            <Avatar className="w-10 h-10">
              {server.image_url ? (
                <AvatarImage 
                  src={`http://localhost:5000${server.image_url}`} // Prepend server URL if needed
                  alt={server.name} 
                  className="object-cover w-full h-full rounded-full" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <AvatarFallback>
                  {getInitials(server.name)}
                </AvatarFallback>
              )}
            </Avatar>
          </button>
        ))}

        {/* Add New Calendar Button */}
        <button 
          className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center mt-auto`} 
          onClick={handleOpenCalendar}
        >
          <Plus size={24} />
        </button>
      </div>

      {isCreateCalendarOpen && (
        <CreateCalendarModal 
          onClose={handleCloseCreateCalendarModal} 
          onNewServer={handleNewServer} // Pass function to update servers
        />
      )}
    </div>
  );
};

export default GroupCalendars;
