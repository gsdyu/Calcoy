import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Home, Calendar, Brain, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import MenuItem from './MenuItem';
import Profile from './Profile';
import Settings from './Settings';

const Navbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');

  return (
    <div className={`
      fixed top-0 left-0 h-screen bg-white shadow-lg 
      transition-all duration-300 ease-in-out
      flex flex-col
      ${isCollapsed ? "w-14" : "w-60"}
    `}>
      <div className="flex items-center justify-end p-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full p-1 hover:bg-gray-100"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <Button
        variant="primary"
        className={`
          mx-2 my-2 bg-blue-500 text-white hover:bg-blue-600
          flex items-center justify-start
          ${isCollapsed ? "p-2" : "px-3 py-2"}
        `}
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
        />
        <MenuItem 
          icon={Calendar} 
          label="Calendar" 
          isActive={activeItem === 'Calendar'} 
          onClick={() => setActiveItem('Calendar')} 
          collapsed={isCollapsed}
        />
        <MenuItem 
          icon={Brain} 
          label="AI" 
          isActive={activeItem === 'AI'} 
          onClick={() => setActiveItem('AI')} 
          collapsed={isCollapsed}
        />
      </nav>
      <div className="mt-auto">
        <Settings isCollapsed={isCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
        <Profile isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default Navbar;