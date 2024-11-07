import React, { useState, useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationSnackbar = ({ 
  message, 
  action, 
  onActionClick, 
  duration = 4000, 
  type = 'success', 
  position = 'bottom' 
}) => {
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
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <X className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    default: <CheckCircle className="w-5 h-5 text-blue-400" />
  };

  const baseColors = {
    success: 'bg-green-500/20 border-green-500/30',
    error: 'bg-red-500/20 border-red-500/30',
    info: 'bg-blue-500/20 border-blue-500/30',
    warning: 'bg-yellow-500/20 border-yellow-500/30',
    default: 'bg-blue-500/20 border-blue-500/30'
  };

  const textColors = {
    success: 'text-green-50',
    error: 'text-red-50',
    info: 'text-blue-50',
    warning: 'text-yellow-50',
    default: 'text-blue-50'
  };

  const positionClasses = {
    top: 'top-4',
    bottom: 'bottom-4'
  };

  return (
    <div className={`
      fixed left-1/2 transform -translate-x-1/2 ${positionClasses[position]}
      flex items-center gap-3 z-50 min-w-[320px] max-w-md
      px-4 py-3 rounded-xl border
      ${baseColors[type]}
      shadow-lg shadow-black/10
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
            flex-shrink-0 px-3 py-1 text-sm font-medium
            ${textColors[type]} hover:bg-white/10
            transition-colors rounded-lg
          `}
        >
          {action}
        </button>
      )}
    </div>
  );
};

// Add these styles to your global CSS
const styles = `
@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translate(-50%, 2rem);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -2rem);
  }
}

.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-out {
  animation: fadeOut 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
`;

export default NotificationSnackbar;