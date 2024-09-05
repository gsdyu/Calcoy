'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Calendar, User, Settings as SettingsIcon, Bell, Brain, CreditCard, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const NavBar = ({ currentSection, setCurrentSection }) => {
  const { darkMode } = useTheme();
  const router = useRouter();

  const navItems = [
    { name: 'Calendar', icon: Calendar },
    { name: 'Profile', icon: User },
    { name: 'Customization', icon: SettingsIcon },
    { name: 'Collaboration', icon: Bell },
    { name: 'AI', icon: Brain },
    { name: 'Billing', icon: CreditCard },
  ];

  const handleNavigation = (route) => {
    setCurrentSection(route);
    // Routing for later
  };

  return (
    <nav className="w-full px-1">
      <Button
        variant="ghost"
        className={`
          w-full flex items-center justify-start p-2 my-1 text-sm font-medium
          transition-colors duration-200
          ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}
        `}
        onClick={() => router.push('/calendar')}
      >
        <ChevronLeft className="h-5 w-5 mr-2" />
        <span>Calendar</span>
      </Button>
      {navItems.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          className={`
            w-full flex items-center justify-start p-2 my-1 text-sm font-medium
            transition-colors duration-200
            ${currentSection === item.name
              ? darkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              : darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-200"
            }
          `}
          onClick={() => handleNavigation(item.name)}
        >
          <item.icon className="h-5 w-5 mr-2" />
          <span>{item.name}</span>
        </Button>
      ))}
    </nav>
  );
};

export default NavBar;