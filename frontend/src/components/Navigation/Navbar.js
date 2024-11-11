import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Calendar, Brain, Plus, ChevronRight, ChevronLeft, Settings as SettingsIcon, Users } from 'lucide-react'; // Import Users icon
import MenuItem from './MenuItem';
import Profile from './Profile';
import { useTheme } from '@/contexts/ThemeContext';

const Navbar = ({ isCollapsed, setIsCollapsed, activeItem, setActiveItem, onAddEvent }) => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const iconColor = darkMode ? "text-white" : "text-gray-600";

  const handleNavigation = (route) => {
    if (setActiveItem) {
      setActiveItem(route);
    }
    switch (route) {
      case 'Calendar':
        router.push('/calendar');
        break;
      case 'Dashboard':
        router.push('/dashboard');
        break;
      case 'Settings':
        router.push('/settings');
        break;
      case 'AI':
        router.push('/ai');
        break;
      case 'Friends': // Add routing for Friends
        router.push('/friends');
        break;
      default:
        router.push('/');  
    }
  };

  useEffect(() => {
    if (pathname.includes('/calendar')) {
      setActiveItem && setActiveItem('Calendar');
    } else if (pathname.includes('/dashboard')) {
      setActiveItem && setActiveItem('Dashboard');
    } else if (pathname.includes('/settings')) {
      setActiveItem && setActiveItem('Settings');
    } else if (pathname.includes('/ai')) {
      setActiveItem && setActiveItem('AI');
    } else if (pathname.includes('/friends')) { // Track Friends page
      setActiveItem && setActiveItem('Friends');
    } else {
      setActiveItem && setActiveItem('Dashboard');
    }
  }, [pathname, setActiveItem]);

  return (
    <div className={`fixed top-0 left-0 h-screen shadow-lg transition-all duration-300 ease-in-out flex flex-col ${isCollapsed ? "w-14" : "w-60"} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
      <div className="flex items-center justify-between p-3">
        {!isCollapsed && (
          <h1 className="text-xl font-bold font-serif ml-2">TimeWise</h1>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className={`rounded-full p-1 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
          onClick={toggleCollapse}
        >
          {isCollapsed ? <ChevronRight className={`h-4 w-4 ${iconColor}`} /> : <ChevronLeft className={`h-4 w-4 ${iconColor}`} />}
        </Button>
      </div>
      <Button
        variant="primary"
        className={`mx-auto my-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center transition-colors duration-200 rounded-full ${isCollapsed ? "w-10 h-10" : "w-[90%] h-10"}`}
        onClick={onAddEvent}
      >
        <Plus className="h-5 w-5 min-w-[20px]" />
        {!isCollapsed && <span className="ml-2">Create</span>}
      </Button>
      <nav className="w-full px-1 flex-grow">
        <MenuItem 
          icon={Home} 
          label="Dashboard" 
          isActive={activeItem === 'Dashboard'} 
          onClick={() => handleNavigation('Dashboard')} 
          collapsed={isCollapsed}
          darkMode={darkMode}
        />
        <MenuItem 
          icon={Calendar} 
          label="Calendar" 
          isActive={activeItem === 'Calendar'} 
          onClick={() => handleNavigation('Calendar')} 
          collapsed={isCollapsed}
          darkMode={darkMode}
        />
        <MenuItem 
          icon={Brain} 
          label="AI" 
          isActive={activeItem === 'AI'} 
          onClick={() => handleNavigation('AI')} 
          collapsed={isCollapsed}
          darkMode={darkMode}
        />
        <MenuItem 
          icon={Users} // Use the Users icon for Friends
          label="Friends"
          isActive={activeItem === 'Friends'} 
          onClick={() => handleNavigation('Friends')}
          collapsed={isCollapsed}
          darkMode={darkMode}
        />
      </nav>
      <div className="mt-auto">
        <MenuItem 
          icon={SettingsIcon} 
          label="Settings" 
          isActive={activeItem === 'Settings'} 
          onClick={() => handleNavigation('Settings')} 
          collapsed={isCollapsed}
          darkMode={darkMode}
        />
        <Profile isCollapsed={isCollapsed} darkMode={darkMode} />
      </div>
    </div>
  );
};

export default Navbar;
