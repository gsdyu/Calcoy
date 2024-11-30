import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const SearchBar = ({ searchQuery, setSearchQuery, setCurrentSection }) => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  
  // Define searchable items with their descriptions
  const searchableItems = [
    { 
      section: 'Profile', 
      keywords: ['account', 'personal information', 'email', 'username', 'photo', 'profile picture']
    },
    { 
      section: 'Customization', 
      keywords: ['theme', 'appearance', 'dark mode', 'light mode', 'colors', 'layout']
    },
    { 
      section: 'Collaboration', 
      keywords: ['sharing', 'team', 'permissions', 'access', 'invite']
    },
    { 
      section: 'AI', 
      keywords: ['artificial intelligence', 'automation', 'smart features', 'assistance']
    },
    { 
      section: 'Billing', 
      keywords: ['payment', 'subscription', 'plan', 'invoice', 'credit card']
    }
  ];

  // Filter items based on search query
  const filteredItems = searchableItems.filter(item => 
    item.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open results when typing
  useEffect(() => {
    if (searchQuery) {
      setIsOpen(true);
    }
  }, [searchQuery]);

  return (
    <div ref={searchRef} className="relative">
      <div className={`relative rounded-xl transition-all duration-200 ${
        isOpen && searchQuery
          ? 'ring-2 ring-blue-500'
          : ''
      }`}>
        <input
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${darkMode 
              ? 'bg-gray-900/40 border-gray-800 text-white placeholder-gray-400' 
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
        />
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 
          ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} 
          size={18}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 
              p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800
              ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && searchQuery && (
        <div className={`absolute w-full mt-2 py-2 rounded-xl shadow-lg border
          ${darkMode 
            ? 'bg-gray-900/95 border-gray-800' 
            : 'bg-white border-gray-200'
          }`}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <button
                key={item.section}
                onClick={() => {
                  setCurrentSection(item.section);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left transition-colors
                  ${darkMode 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-50 text-gray-700'
                  }
                  ${index !== filteredItems.length - 1 
                    ? darkMode 
                      ? 'border-b border-gray-800' 
                      : 'border-b border-gray-100'
                    : ''
                  }`}
              >
                <div className="font-medium">{item.section}</div>
                <div className={`text-sm ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {item.keywords.slice(0, 3).join(', ')}
                </div>
              </button>
            ))
          ) : (
            <div className={`px-4 py-2 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;