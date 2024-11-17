import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const NotificationSnackbar = ({ 
  message, 
  action, 
  onActionClick, 
  duration = 4000, 
  type = 'success', 
  position = 'bottom' 
}) => {
  const { darkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setExitAnimation(false);

      const animationTimer = setTimeout(() => {
        setExitAnimation(true);
      }, duration - 500);

      const visibilityTimer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => {
        clearTimeout(animationTimer);
        clearTimeout(visibilityTimer);
      };
    }
  }, [message, duration]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className={darkMode ? "w-5 h-5 text-green-400" : "w-5 h-5 text-green-600"} />,
    error: <X className={darkMode ? "w-5 h-5 text-red-400" : "w-5 h-5 text-red-600"} />,
    info: <Info className={darkMode ? "w-5 h-5 text-blue-400" : "w-5 h-5 text-blue-600"} />,
    warning: <AlertTriangle className={darkMode ? "w-5 h-5 text-yellow-400" : "w-5 h-5 text-yellow-600"} />
  };

  const baseColors = {
    success: darkMode 
      ? 'bg-green-500/20 border-green-500/30' 
      : 'bg-green-50 border-green-200',
    error: darkMode 
      ? 'bg-red-500/20 border-red-500/30' 
      : 'bg-red-50 border-red-200',
    info: darkMode 
      ? 'bg-blue-500/20 border-blue-500/30' 
      : 'bg-blue-50 border-blue-200',
    warning: darkMode 
      ? 'bg-yellow-500/20 border-yellow-500/30' 
      : 'bg-yellow-50 border-yellow-200'
  };

  const textColors = {
    success: darkMode ? 'text-green-50' : 'text-green-800',
    error: darkMode ? 'text-red-50' : 'text-red-800',
    info: darkMode ? 'text-blue-50' : 'text-blue-800',
    warning: darkMode ? 'text-yellow-50' : 'text-yellow-800'
  };

  const buttonHoverColors = {
    success: darkMode 
      ? 'hover:bg-green-500/20' 
      : 'hover:bg-green-100',
    error: darkMode 
      ? 'hover:bg-red-500/20' 
      : 'hover:bg-red-100',
    info: darkMode 
      ? 'hover:bg-blue-500/20' 
      : 'hover:bg-blue-100',
    warning: darkMode 
      ? 'hover:bg-yellow-500/20' 
      : 'hover:bg-yellow-100'
  };

  const positionClasses = {
    top: 'top-4',
    bottom: 'bottom-4'
  };

  return (
    <div className={`
      fixed left-1/2 transform -translate-x-1/2 ${positionClasses[position]}
      flex items-center gap-3 z-50 min-w-[320px] max-w-md
      px-4 py-3 rounded-xl border backdrop-blur-sm
      ${baseColors[type]}
      ${darkMode ? 'shadow-lg shadow-black/10' : 'shadow-md shadow-black/5'}
      ${exitAnimation ? 'animate-fade-out' : 'animate-slide-up'}
    `}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      
      <div className={`flex-grow text-sm font-medium ${textColors[type]}`}>
        {message}
      </div>

      {action && (
        <button
          onClick={onActionClick}
          className={`
            flex-shrink-0 px-3 py-1 text-sm font-medium rounded-lg
            ${textColors[type]} ${buttonHoverColors[type]}
            transition-colors duration-200
          `}
        >
          {action}
        </button>
      )}
    </div>
  );
};

export default NotificationSnackbar;