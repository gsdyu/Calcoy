import React from 'react';
import { Button } from "@/components/ui/button";
import { Home, Calendar, Brain, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import MenuItem from './MenuItem';
import Profile from './Profile';
import Settings from './Settings';
import { useTheme } from '@/contexts/ThemeContext';

const Navbar = ({ isCollapsed, setIsCollapsed, activeItem, setActiveItem, onAddEvent }) => {
  const { darkMode } = useTheme();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`
      fixed top-0 left-0 h-screen shadow-lg 
      transition-all duration-300 ease-in-out
      flex flex-col
      ${isCollapsed ? "w-14" : "w-60"}
      ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}
    `}>
      <div className="flex items-center justify-end p-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`rounded-full p-1 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          onClick={toggleCollapse}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <Button
        variant="primary"
        className={`
          mx-2 my-2 bg-blue-500 text-white hover:bg-blue-600
          flex items-center justify-center
          ${isCollapsed ? "p-2" : "px-3 py-2"}
        `}
        onClick={onAddEvent}
      >
        <Plus className="h-5 w-5 min-w-[20px]" />
        {!isCollapsed && <span className="ml-3">Add event</span>}
      </Button>
      <nav className="w-full px-1 flex-grow">
        <MenuItem 
          icon={Home} 
          label="Dashboard" 
          isActive={activeItem === 'Dashboard'} 
          onClick={() => setActiveItem('Dashboard')} 
          collapsed={isCollapsed}
          darkMode={darkMode}
        />
        <MenuItem 
          icon={Calendar} 
          label="Calendar" 
          isActive={activeItem === 'Calendar'} 
          onClick={() => setActiveItem('Calendar')} 
          collapsed={isCollapsed}
          darkMode={darkMode}
        />
        <MenuItem 
          icon={Brain} 
          label="AI" 
          isActive={activeItem === 'AI'} 
          onClick={() => setActiveItem('AI')} 
          collapsed={isCollapsed}
          darkMode={darkMode}
        />
      </nav>
      <div className="mt-auto">
        <Settings isCollapsed={isCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} darkMode={darkMode} />
        <Profile isCollapsed={isCollapsed} darkMode={darkMode} />
      </div>
    </div>
  );
};

export default Navbar;