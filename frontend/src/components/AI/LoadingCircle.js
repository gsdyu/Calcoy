import React from 'react';

const LoadingCircle = () => {
  return (
    <div className="flex items-center justify-center h-7">
      <div className="w-4 h-4 rounded-full bg-blue-500 animate-loadingCircle" />
      <style>{`
        @keyframes loadingCircle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.5);
          }
        }
        .animate-loadingCircle {
          animation: loadingCircle 1s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoadingCircle;
