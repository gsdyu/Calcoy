import React from 'react';

const LoadingBars = () => {
  return (
    <div className="loading-container">
      <div className="loading-bar gradient-1 animate-loading"></div>
      <div className="loading-bar gradient-2 animate-loading"></div>
      <div className="loading-bar gradient-3 animate-loading"></div>
      <style>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          width: 100%;
        }

        /* Keyframe for the expanding animation */
        @keyframes expanding {
          0% {
            transform: scaleX(0);
            opacity: 0;
            width: 0;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        /* Keyframe for the moving gradient animation */
        @keyframes moving {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .animate-loading {
          transform-origin: left;
          animation: expanding 0.2s 0.4s forwards linear, moving 1s infinite forwards linear;
        }

        .loading-bar {
          height: 1.05rem;
          border-radius: 0.25rem;
          background-size: 200% auto;
          opacity: 0;
        }

        .gradient-1 {
          background-image: linear-gradient(to right, rgba(211, 211, 211, 0.1) 30%, rgba(37, 99, 235, 1) 60%, rgba(211, 211, 211, 0.1));
          width: 80%;
        }
        
        .gradient-2 {
          background-image: linear-gradient(to right, rgba(37, 99, 235, 1), rgba(211, 211, 211, 0.1) 60%, rgba(37, 99, 235, 1));
          width: 100%;
        }
        
        .gradient-3 {
          background-image: linear-gradient(to right, rgba(211, 211, 211, 0.1) 50%, rgba(37, 99, 235, 1) 90%, rgba(211, 211, 211, 0.1));
          width: 60%;
        }

        .gradient-1.animate-loading {
          animation-delay: 0.5s, 0s;
        }
        
        .gradient-2.animate-loading {
          animation-delay: 0.6s, 0.2s;
        }
        
        .gradient-3.animate-loading {
          animation-delay: 0.7s, 0.4s;
        }
      `}</style>
    </div>
  );
};

export default LoadingBars;
