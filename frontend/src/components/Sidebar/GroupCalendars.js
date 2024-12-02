
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronRight, ChevronLeft, Users, Calendar as CalendarIcon, X,Copy, Check,UserPlus,LogOut} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import CreateCalendarModal from '@/components/Modals/createCalendarModal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GroupCalendars = ({ toggleSidebar, isSidebarOpen, activeCalendar, setActiveCalendar, fetchEvents, servers, setServers }) => {
  const { darkMode, selectedTheme, presetThemes } = useTheme();
  const [isCreateCalendarOpen, setIsCreateCalendarOpen] = useState(false);
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [hoveredServer, setHoveredServer] = useState(null);
  const [isAddHovered, setIsAddHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, server: null });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null); 

  // Fetch servers from the backend
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/servers`, {
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
  const handleContextMenu = (event, server) => {
    event.preventDefault();
    setContextMenu({
      server,
      x: event.clientX,
      y: event.clientY,
    });
  };
  const handleRightClick = (e, server) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
    setSelectedServer(server); // Set the selected server immediately
  };
  const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, server: null });

  const leaveServer = async () => {
    if (selectedServer) {
      try {
        const response = await fetch(`http://localhost:5000/api/servers/${selectedServer.id}/leave`, {
          method: 'DELETE',
          credentials: 'include',
        });
  
        if (response.ok) {
          setServers((prev) => prev.filter((server) => server.id !== selectedServer.id));
          setActiveCalendar(null);
          setShowLeaveModal(false); // Close the modal
          setSelectedServer(null); // Reset selected server
        } else {
          console.error('Failed to leave server');
        }
      } catch (error) {
        console.error('Error leaving server:', error);
      }
    }
  };

  // Get the background classes based on theme
  const backgroundClasses = selectedTheme 
    ? `${presetThemes[selectedTheme]?.gradient} bg-opacity-95`
    : darkMode 
      ? 'bg-gray-800' 
      : 'bg-white';

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) closeContextMenu();
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible]);
  return (
    <div className={`w-16 ${backgroundClasses} flex flex-col items-center py-4 h-screen relative z-40`}>
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
              onContextMenu={(e) => handleRightClick(e, server)}

            >
              <Avatar className="w-10 h-10">
                {server.image_url ? (
                  <AvatarImage 
                  src={server.image_url.startsWith('http') ? server.image_url : `${process.env.NEXT_PUBLIC_SERVER_URL}${server.image_url}`}
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
        <div className="relative" onMouseEnter={() => setIsAddHovered(true)} onMouseLeave={() => setIsAddHovered(false)}>
          <button 
            className={`w-12 h-12 rounded-full ${
              darkMode ? 'bg-gray-700' : 'bg-gray-300'
            } flex items-center justify-center mt-auto relative overflow-hidden transition-all duration-300 transform ${
              isAddHovered ? 'scale-110 shadow-lg' : ''
            }`}
            onClick={handleOpenCalendar}
          >
            <Plus 
              size={24} 
              className={`transition-all duration-300 ${
                isAddHovered ? 'rotate-90 text-blue-500' : ''
              }`}
            />
            <div className={`absolute inset-0 bg-blue-500 opacity-0 transition-opacity duration-300 ${
              isAddHovered ? 'opacity-10' : ''
            }`} />
          </button>

          {/* Add Server Tooltip */}
          {isAddHovered && (
            <div className="absolute -left-full top-1/2 transform -translate-x-full -translate-y-1/2 z-50">
              <div className={`relative ${darkMode ? 'bg-[#18191c]' : 'bg-white'} px-3 py-2 rounded-[3px] shadow-[0_8px_16px_rgba(0,0,0,0.24)]`}>
                <div className={`text-[15px] font-medium ${darkMode ? 'text-white/90' : 'text-gray-900'}`}>
                  Create a Calendar
                </div>
                <div className="absolute top-1/2 -right-[4px] -translate-y-1/2">
                  <div className={`w-[8px] h-[8px] rotate-45 ${darkMode ? 'bg-[#18191c]' : 'bg-white'}`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {contextMenu.visible && (
      <div
       className="absolute z-50 bg-gray-900 shadow-lg rounded-md py-.99"
      style={{
          top: contextMenu.y,
          left: contextMenu.x - 1650, // Move the context menu 50px to the left
        }}
      >
{/* Invite Button */}
<button
    onClick={() => {
      setShowInviteModal(true);
      closeContextMenu();
    }}
    className="block w-full px-4 py-2 text-sm flex items-center bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
  >
    <UserPlus size={18} className="mr-3 text-blue-500" />
    <span className="font-medium text-white">Invite</span>
  </button>

  {/* Divider */}
  <div className={darkMode ? "border-t border-gray-700 my-1" : "border-t border-gray-300 my-1"}></div>

  {/* Leave Button */}
  <button
    onClick={() => {
      setShowLeaveModal(true);
      closeContextMenu();
    }}
    className="block w-full px-4 py-2 text-sm flex items-center bg-gray-800 rounded-lg hover:bg-red-700 hover:text-white transition-colors"
  >
    <LogOut size={18} className="mr-3 text-red-500" />
    <span className="font-medium text-red-500">Leave</span>
  </button>
</div>

    )}
{showInviteModal && selectedServer && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50">
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md w-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Invite Friends</h2>
        <button
          onClick={() => setShowInviteModal(false)}
          className={`p-2 rounded-full transition-colors
            ${darkMode 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
        >
          <X size={20} />
        </button>
      </div>
      <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Share this invite link with your friends to join the calendar:
      </p>
      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={`https://timewise.com/invite/${selectedServer.invite_link}`}
          readOnly
          className={`w-full p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50
            ${darkMode 
              ? 'bg-gray-800/50 text-gray-200 border border-gray-700' 
              : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `https://timewise.com/invite/${selectedServer.invite_link}`
            );
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
          }}
          className={`p-3 rounded-full transition-colors duration-150 text-white
            ${copySuccess 
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'}`}
        >
          {copySuccess ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  </div>
)}

{showLeaveModal && selectedServer && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50">
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md w-96">
      <h2 className="text-xl font-semibold mb-4">Leave '{selectedServer.name}'</h2>
      <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Are you sure you want to leave {selectedServer.name}? You won't be able to rejoin unless you are re-invited.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setShowLeaveModal(false)}
          className={`px-6 py-2 rounded-full 
            ${darkMode 
              ? 'border border-gray-700 hover:bg-gray-800/50' 
              : 'border border-gray-200 hover:bg-gray-100'} 
            transition-colors`}
        >
          Cancel
        </button>
        <button
          onClick={leaveServer}
          className="px-8 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 
            hover:from-red-600 hover:to-red-700 text-white transition-colors"
        >
          Leave Server
        </button>
      </div>
    </div>
  </div>
)}


     
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
