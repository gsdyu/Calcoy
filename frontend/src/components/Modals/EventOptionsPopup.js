import React from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';

const EventOptionsPopup = ({ showEventPopup, darkMode, handleEventOptionSelect }) => {
  if (!showEventPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`
        ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}
        w-96 rounded-2xl shadow-xl transform transition-all
        border border-gray-800/10
      `}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800/10">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Calendar Privacy Settings</h3>
            <button 
              onClick={() => handleEventOptionSelect('dont_show')}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Choose how your personal events will appear to others in this server
          </p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Don't Show Option */}
          <button
            onClick={() => handleEventOptionSelect('dont_show')}
            className={`
              w-full p-4 rounded-xl transition-all
              ${darkMode 
                ? 'hover:bg-red-500/10 bg-gray-800/50' 
                : 'hover:bg-red-50 bg-gray-50'
              }
              group flex items-start gap-4
            `}
          >
            <div className="mt-1">
              <EyeOff className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-left">
              <div className="font-medium mb-1 flex items-center gap-2">
                Private
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Keep all your events private. Others won't see any of your personal calendar events.
              </p>
            </div>
          </button>

          {/* Limited Option */}
          <button
            onClick={() => handleEventOptionSelect('limited')}
            className={`
              w-full p-4 rounded-xl transition-all
              ${darkMode 
                ? 'hover:bg-yellow-500/10 bg-gray-800/50' 
                : 'hover:bg-yellow-50 bg-gray-50'
              }
              group flex items-start gap-4
            `}
          >
            <div className="mt-1">
              <Lock className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-left">
              <div className="font-medium mb-1">Limited Visibility</div>
              <p className="text-sm text-gray-400">
                Only show when you're busy. Others will see "Username" instead of event details.
              </p>
            </div>
          </button>

          {/* Full Option */}
          <button
            onClick={() => handleEventOptionSelect('full')}
            className={`
              w-full p-4 rounded-xl transition-all
              ${darkMode 
                ? 'hover:bg-green-500/10 bg-gray-800/50' 
                : 'hover:bg-green-50 bg-gray-50'
              }
              group flex items-start gap-4
            `}
          >
            <div className="mt-1">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-left">
              <div className="font-medium mb-1">Full Visibility</div>
              <p className="text-sm text-gray-400">
                Share complete event details. Others can see all information about your events.
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800/10">
          <p className="text-xs text-gray-400">
            You can change these settings later in your server preferences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventOptionsPopup;