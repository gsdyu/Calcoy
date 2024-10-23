import React from 'react';

const LoadingDots = () => {
  return (
    <div className="flex items-center space-x-1.5 h-8">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-[dramaticBounce_1s_infinite] [animation-delay:-0.3s]" />
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-[dramaticBounce_1s_infinite] [animation-delay:-0.15s]" />
      <div className="w-2 h-2 rounded-full bg-blue-600 animate-[dramaticBounce_1s_infinite]" />
      <style>{`
        @keyframes dramaticBounce {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-10px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingDots;