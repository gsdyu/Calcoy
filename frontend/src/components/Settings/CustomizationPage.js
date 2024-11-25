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

  // Define color themes that should use light text
  const darkThemes = ['sky-waves', 'blue-purple'];
  
  // Get current theme's text mode
  const getThemeMode = (themeId) => {
    if (!themeId) return darkMode;
    return darkThemes.includes(themeId);
  };

  const handleColorModeSelect = (mode) => {
    setSelectedOption(mode);
    toggleDarkMode(mode === 'dark' ? true : mode === 'light' ? false : undefined);
    setSelectedTheme(null);
    localStorage.setItem('selectedTheme', '');
    localStorage.setItem('darkMode', mode === 'dark' ? 'true' : mode === 'light' ? 'false' : '');
  };

  const handleThemeSelect = (themeId) => {
    setSelectedOption(themeId);
    setSelectedTheme(themeId);
    localStorage.setItem('selectedTheme', themeId);
  };

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      setSelectedOption(savedTheme);
    } else if (savedDarkMode !== null) {
      toggleDarkMode(savedDarkMode === 'true' ? true : savedDarkMode === 'false' ? false : undefined);
      setSelectedOption(savedDarkMode === 'true' ? 'dark' : savedDarkMode === 'false' ? 'light' : 'system');
    }
  }, []);

  const presetThemes = [
    { id: 'soft-pink', name: 'Soft Pink', gradient: 'bg-gradient-to-r from-pink-200 via-pink-100 to-white' },
    { id: 'morning-sunrise', name: 'Morning Sunrise', gradient: 'bg-gradient-to-b from-yellow-100 via-purple-100 to-blue-200' },
    { id: 'sky-waves', name: 'Sky Waves', gradient: 'bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600' },
    { id: 'blue-purple', name: 'Blue Purple', gradient: 'bg-gradient-to-b from-blue-400 via-blue-500 to-purple-600' },
    { id: 'northern-lights', name: 'Northern Lights', gradient: 'bg-gradient-to-b from-blue-400 via-purple-300 to-green-200' }
  ];

  const currentThemeMode = getThemeMode(selectedTheme);

  // Consistent button styling function
  const getButtonStyle = (isSelected, isDark) => {
    if (isSelected) {
      return isDark
        ? 'bg-white/10 border-white/20'
        : 'bg-gray-50 border-gray-200';
    }
    return isDark
      ? 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/40'
      : 'bg-white border-gray-200 hover:bg-gray-50';
  };

  return (
    <div className={`p-8 ${selectedTheme ? presetThemes.find(t => t.id === selectedTheme)?.gradient : ''}`}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-2xl font-semibold mb-8 ${currentThemeMode ? 'text-white' : 'text-black'}`}>
          Themes
        </h1>

        <div className="space-y-8">
          <div>
            <h2 className={`text-sm font-medium mb-4 ${currentThemeMode ? 'text-gray-300' : 'text-gray-600'}`}>
              COLOR MODE
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', icon: Sun, label: 'Light mode' },
                { id: 'dark', icon: Moon, label: 'Dark mode' },
                { id: 'system', icon: Monitor, label: 'System' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleColorModeSelect(id)}
                  className={`flex items-center p-4 rounded-2xl border transition-colors ${
                    getButtonStyle(selectedOption === id, currentThemeMode)
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${currentThemeMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <span className={currentThemeMode ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className={`text-sm font-medium mb-4 ${currentThemeMode ? 'text-gray-300' : 'text-gray-600'}`}>
              PRESET THEMES
            </h2>
            <div className="space-y-2">
              {presetThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`w-full p-4 rounded-2xl border transition-colors ${
                    getButtonStyle(selectedOption === theme.id, currentThemeMode)
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div className={`w-full h-full ${theme.gradient}`}></div>
                    </div>
                    <span className={currentThemeMode ? 'text-gray-300' : 'text-gray-700'}>
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