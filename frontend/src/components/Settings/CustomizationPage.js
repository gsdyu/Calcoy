import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

const CustomizationPage = () => {
  const { 
    darkMode,
    selectedTheme,
    currentMode,
    colors,
    presetThemes,
    handleThemeChange,
    handleColorModeChange
  } = useTheme();
  
  const [selectedOption, setSelectedOption] = React.useState(currentMode);

  React.useEffect(() => {
    setSelectedOption(selectedTheme || currentMode);
  }, [darkMode, selectedTheme, currentMode]);

  return (
    <div className={`p-8 ${selectedTheme ? presetThemes[selectedTheme]?.gradient : ''}`}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-2xl font-semibold mb-8 ${colors.text}`}>
          Themes
        </h1>

        <div className="space-y-8">
          <div>
            <h2 className={`text-sm font-medium mb-4 ${colors.textSecondary}`}>
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
                  onClick={() => {
                    handleColorModeChange(id);
                    setSelectedOption(id);
                  }}
                  className={`flex items-center p-4 rounded-2xl border transition-colors ${
                    selectedOption === id ? colors.selectedBg + ' ' + colors.selectedBorder : colors.buttonBg + ' ' + colors.buttonBorder
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${colors.textSecondary}`} />
                  <span className={colors.text}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className={`text-sm font-medium mb-4 ${colors.textSecondary}`}>
              PRESET THEMES
            </h2>
            <div className="space-y-2">
              {Object.entries(presetThemes).map(([id, theme]) => (
                <button
                  key={id}
                  onClick={() => {
                    handleThemeChange(id);
                    setSelectedOption(id);
                  }}
                  className={`w-full p-4 rounded-2xl border transition-colors ${
                    selectedOption === id ? colors.selectedBg + ' ' + colors.selectedBorder : colors.buttonBg + ' ' + colors.buttonBorder
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div className={`w-full h-full ${theme.gradient}`}></div>
                    </div>
                    <span className={colors.text}>
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