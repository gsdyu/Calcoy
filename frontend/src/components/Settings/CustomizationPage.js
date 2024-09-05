import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import Toggle from '@/components/common/Toggle';

const CustomizationPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Appearance</h1>
        
        <div className={`rounded-lg p-6 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Theme</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                {darkMode ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <span className="text-lg">{darkMode ? 'Dark' : 'Light'} Mode</span>
            </div>
            <Toggle isOn={darkMode} onToggle={toggleDarkMode} />
          </div>
        </div>

        <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <p className="text-lg mb-2">This is how your app will look.</p>
            <div className="flex space-x-2">
              <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
              <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-green-500' : 'bg-green-600'}`}></div>
              <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-red-500' : 'bg-red-600'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPage;