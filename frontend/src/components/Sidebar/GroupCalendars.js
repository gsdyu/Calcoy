'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronRight, ChevronLeft, Users, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import CreateCalendarModal from '@/components/Modals/createCalendarModal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GroupCalendars = ({ toggleSidebar, isSidebarOpen, activeCalendar, setActiveCalendar, fetchEvents, servers, setServers }) => {
  const { darkMode } = useTheme();
  const [isCreateCalendarOpen, setIsCreateCalendarOpen] = useState(false);
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [hoveredServer, setHoveredServer] = useState(null);

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
  }, [setServers]);

  const handleOpenCalendar = () => {
    setIsCreateCalendarOpen(true);
  };

  const handleCloseCreateCalendarModal = () => {
    setIsCreateCalendarOpen(false);
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

  const leaveServer = async (serverId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${serverId}/leave`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setServers((prev) => prev.filter((server) => server.id !== serverId));
        setActiveCalendar(null); // Set to null or default calendar after leaving
      } else {
        console.error('Failed to leave server');
      }
    } catch (error) {
      console.error('Error leaving server:', error);
    }
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
          onClick={() => handleCalendarChange(null)}
        >
          <Calendar size={24} className="text-white" />
        </button>

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
                className={`absolute -right-1 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  activeCalendar?.id === server.id
                    ? 'h-10 bg-white w-1 rounded-l-full' 
                    : hoveredServer === server.id
                    ? 'h-5 bg-white w-1 rounded-l-full'  
                    : 'h-0 w-0'                          
                }`}
              />
            </button>

            {/* Tooltip on Hover */}
            {hoveredServer === server.id && (
              <div className="absolute -left-full top-1/2 transform -translate-x-full -translate-y-1/2 z-50">
                <div className={`relative ${darkMode ? 'bg-[#18191c]' : 'bg-white'} px-3 py-2 rounded-[3px] shadow-[0_8px_16px_rgba(0,0,0,0.24)]`}>
                  <div className="flex flex-col gap-1">
                    <div className={`text-[15px] font-medium ${darkMode ? 'text-white/90' : 'text-gray-900'}`}>
                      {server.name}
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                      <div className="flex items-center gap-1">
                        <Users size={12} /> {/* Connect users in server here later*/}
                      </div>
                      <div className={`w-0.5 h-0.5 rounded-full ${darkMode ? 'bg-white/30' : 'bg-gray-400'}`} />
                      <div className="flex items-center gap-1">
                        <CalendarIcon size={12} /> {/* Connect events here later like events gonna be hosted or shared together for everyone*/}
                      </div> 
                    </div>
                  </div>
                  {/* Discord-style Tooltip Pointer */}
                  <div className="absolute top-1/2 -right-[4px] -translate-y-1/2">
                    <div className={`w-[8px] h-[8px] rotate-45 ${darkMode ? 'bg-[#18191c]' : 'bg-white'}`} />
                  </div>
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