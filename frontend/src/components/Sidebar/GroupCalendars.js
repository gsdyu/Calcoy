'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import CreateCalendarModal from '@/components/Modals/createCalendarModal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GroupCalendars = ({ toggleSidebar, isSidebarOpen, activeCalendar, setActiveCalendar, fetchEvents }) => {
  const { darkMode } = useTheme();
  const [isCreateCalendarOpen, setIsCreateCalendarOpen] = useState(false);
  const [servers, setServers] = useState([]);
  const [icon, setIcon] = useState(null); 
  const [iconPreview, setIconPreview] = useState(null);
  const [hoveredServer, setHoveredServer] = useState(null); // State to track hovered server
  
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

   const handleCalendarChange = (server) => {
    setActiveCalendar(server);  
    fetchEvents(server);  
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
          onClick={() => handleCalendarChange(null)} // Pass null for default calendar
        >
          <Calendar size={24} className="text-white" />
        </button>
        
        {/* Shared Calendar Button */}
     
        <div className="w-8 h-0.5 bg-gray-600 my-2"></div>

        {/* Servers (Group Calendars) */}
        {servers.map((server) => (
          <div key={server.id} className="relative" onMouseEnter={() => setHoveredServer(server.id)} onMouseLeave={() => setHoveredServer(null)}>
            <button 
              onClick={() => handleCalendarChange(server)} 
              className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center relative`}
            >
              <Avatar className="w-10 h-10">
                {server.image_url ? (
                  <AvatarImage 
                    src={`http://localhost:5000${server.image_url}`} 
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

              {/* Right Border Effect */}
              <div
                className={`absolute right-0 top-1/2 transform -translate-y-1/2 transition-all duration-200 origin-center ${
                  activeCalendar?.id === server.id
                    ? 'bg-white w-1 h-full scale-y-100' 
                    : hoveredServer === server.id
                    ? 'bg-white w-1 h-4 scale-y-125' 
                    : 'w-0 h-1'  
                }`}
              />
            </button>

            {/* Tooltip on Hover */}
            {hoveredServer === server.id && (
              <div className="absolute -left-full top-1/2 transform -translate-x-full -translate-y-1/2 p-2 bg-gray-800 text-white rounded-lg shadow-lg flex items-center space-x-2" style={{ minWidth: '150px' }}>
                {/* Tooltip Pointer */}
                <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-800 transform rotate-45" />
                </div>
                <div>
                  <div className="font-semibold">{server.name}</div>
                </div>
              </div>
            )}
          </div>
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
          setServers={setServers}
          setIcon={setIcon}
          setIconPreview={setIconPreview}
        />
      )}
    </div>
  );
};

export default GroupCalendars;
