import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

const CustomizationPage = () => {
  const { darkMode, toggleDarkMode, selectedTheme, setSelectedTheme } = useTheme();
  
  const getCurrentMode = () => {
    if (darkMode === true) return 'dark';
    if (darkMode === false) return 'light';
    if (darkMode === undefined) return 'system';
    return selectedTheme;
  };

  const [selectedOption, setSelectedOption] = React.useState(getCurrentMode());

  React.useEffect(() => {
    setSelectedOption(getCurrentMode());
  }, [darkMode]);

  const handleColorModeSelect = (mode) => {
    setSelectedOption(mode);
    toggleDarkMode(mode === 'dark' ? true : mode === 'light' ? false : undefined);
    setSelectedTheme(null);
  };

  const handleThemeSelect = (themeId) => {
    setSelectedOption(themeId);
    setSelectedTheme(themeId);
    toggleDarkMode(undefined);
  };

  const presetThemes = [
    { id: 'soft-pink', name: 'Soft Pink', gradient: 'bg-gradient-to-r from-pink-200 via-pink-100 to-white' },
    { id: 'morning-sunrise', name: 'Morning Sunrise', gradient: 'bg-gradient-to-b from-yellow-100 via-purple-100 to-blue-200' },
    { id: 'sky-waves', name: 'Sky Waves', gradient: 'bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600' },
    { id: 'blue-purple', name: 'Blue Purple', gradient: 'bg-gradient-to-b from-blue-400 via-blue-500 to-purple-600' },
    { id: 'northern-lights', name: 'Northern Lights', gradient: 'bg-gradient-to-b from-blue-400 via-purple-300 to-green-200' }
  ];

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-2xl font-semibold mb-8 ${darkMode ? 'text-white' : 'text-black'}`}>
          Themes
        </h1>

        <div className="space-y-8">
          <div>
            <h2 className={`text-sm font-medium mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              COLOR MODE
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleColorModeSelect('light')}
                className={`flex items-center p-4 rounded-2xl border transition-colors ${
                  selectedOption === 'light'
                    ? darkMode
                      ? 'bg-blue-900/25 border-blue-800/50'
                      : 'bg-blue-50 border-blue-200'
                    : darkMode
                      ? 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/40'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Sun className={`w-5 h-5 mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Light mode</span>
              </button>

              <button
                onClick={() => handleColorModeSelect('dark')}
                className={`flex items-center p-4 rounded-2xl border transition-colors ${
                  selectedOption === 'dark'
                    ? darkMode
                      ? 'bg-blue-900/25 border-blue-800/50'
                      : 'bg-blue-50 border-blue-200'
                    : darkMode
                      ? 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/40'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Moon className={`w-5 h-5 mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Dark mode</span>
              </button>

              <button
                onClick={() => handleColorModeSelect('system')}
                className={`flex items-center p-4 rounded-2xl border transition-colors ${
                  selectedOption === 'system'
                    ? darkMode
                      ? 'bg-blue-900/25 border-blue-800/50'
                      : 'bg-blue-50 border-blue-200'
                    : darkMode
                      ? 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/40'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Monitor className={`w-5 h-5 mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>System</span>
              </button>
            </div>
          </div>

          <div>
            <h2 className={`text-sm font-medium mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              PRESET THEMES
            </h2>
            <div className="space-y-2">
              {presetThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`w-full p-4 rounded-2xl border transition-colors ${
                    selectedOption === theme.id
                      ? darkMode 
                        ? 'bg-blue-900/25 border-blue-800/50'
                        : 'bg-blue-50 border-blue-200'
                      : darkMode
                        ? 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/40'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div className={`w-full h-full ${theme.gradient}`}></div>
                    </div>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {theme.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPage;