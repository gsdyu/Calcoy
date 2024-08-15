import React from 'react';
import { User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const PersonalCalendar = () => {
  const { darkMode } = useTheme();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Personal Calendar</h2>
      <button className={`flex items-center space-x-2 hover:${darkMode ? 'bg-gray-600' : 'bg-gray-200'} p-2 rounded w-full`}>
        <User size={18} /> <span>My Calendar</span>
      </button>
    </div>
  );
};

export default PersonalCalendar;