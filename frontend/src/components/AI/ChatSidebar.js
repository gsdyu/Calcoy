import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AiPage.module.css';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageSquare,
  SquarePen,
  Menu,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react';

const ChatItem = ({
  chat,
  isActive,
  onSelect,
  onRename,
  onDelete,
  isCollapsed,
  darkMode,
  selectedTheme,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRename = () => {
    if (editTitle.trim()) {
      onRename(chat.id, editTitle);
    }
    setIsEditing(false);
  };

  const chatContent = (
    <div
      className={`
        relative group flex items-center gap-2 p-3 my-1 rounded-xl
        transition-colors duration-200
        ${selectedTheme 
          ? 'bg-white/10 hover:bg-white/20' 
          : isActive
            ? darkMode
              ? 'bg-gray-700'
              : 'bg-gray-100'
            : darkMode
              ? 'hover:bg-gray-700'
              : 'hover:bg-gray-100'}
        ${darkMode ? 'text-gray-300' : 'text-gray-600'}
      `}
    >
      <button
        onClick={() => onSelect(chat.id)}
        className="flex-1 flex items-center gap-3 min-w-0"
      >
        <MessageSquare size={20} className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-blue-500' : ''}`}  />
        {!isCollapsed && (
          <div className="flex-1 min-w-0 text-left pl-1">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className={`
                  w-full px-2 py-1 rounded-lg text-left
                  ${selectedTheme
                    ? 'bg-white/80 dark:bg-gray-900/80'
                    : darkMode
                      ? 'bg-gray-700 text-gray-100 border-gray-600'
                      : 'bg-white text-gray-900 border-gray-200'}
                  border focus:outline-none focus:ring-1
                  ${darkMode
                    ? 'focus:ring-blue-500'
                    : 'focus:ring-blue-400'}
                `}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="space-y-1">
                <span className="block truncate text-left font-medium">
                  {chat.title || 'New Chat'}
                </span>
                <span
                  className={`
                    text-xs truncate block
                    ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                  `}
                >
                  {new Date(chat.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </button>

      {!isCollapsed && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`
              p-1 rounded-xl opacity-0 group-hover:opacity-100 
              transition-opacity duration-200
              ${selectedTheme
                ? 'hover:bg-white/20 text-white/70 hover:text-white'
                : darkMode
                  ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}
            `}
          >
            <MoreVertical size={17} />
          </button>

          {isMenuOpen && (
            <div
              className={`
                absolute right-0 mt-1 w-36 p-2 rounded-xl shadow-lg z-50
                border transition-colors duration-200
                ${selectedTheme
                  ? 'bg-white/90 dark:bg-gray-900/90 border-white/20'
                  : darkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-200'}
              `}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setIsMenuOpen(false);
                }}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm
                  transition-colors duration-200 rounded-xl w-full
                  ${selectedTheme
                    ? 'text-gray-800 dark:text-gray-200 hover:bg-white/20'
                    : darkMode
                      ? 'text-gray-200 hover:bg-gray-600'
                      : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                <Pencil size={16} />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chat.id);
                  setIsMenuOpen(false);
                }}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm
                  transition-colors duration-200 rounded-xl w-full
                  ${darkMode
                    ? 'text-red-400 hover:bg-gray-600'
                    : 'text-red-600 hover:bg-gray-100'}
                `}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {chatContent}
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          className={`
            ${selectedTheme
              ? 'bg-white/90 text-gray-800 dark:bg-gray-900/90 dark:text-gray-200'
              : darkMode 
                ? 'bg-gray-300 text-gray-600' 
                : 'bg-gray-100 text-gray-800'}
            border ${darkMode ? 'border-gray-600' : 'border-gray-200'}
            shadow-lg rounded-xl max-w-52
          `}
        >
          <p>{chat.title || 'New Chat'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ChatSidebar = ({
  currentChatId,
  onChatSelect,
  onNewChat,
  onRename,
  onDelete,
  chats = [],
  darkMode,
  selectedTheme,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatSidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('chatSidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  return (
    <div
      className={`
        flex flex-col border-l 
        transition-all duration-300 ease-in-out
        overflow-hidden shadow-lg shadow-black/10
        ${selectedTheme 
          ? 'bg-transparent border-white/20' 
          : darkMode 
            ? 'bg-gray-800 border-gray-800' 
            : 'bg-white border-gray-200'}
        ${isCollapsed ? 'w-16' : 'w-72'}
        h-full
      `}
    >
      {/* top buttons */}
      <div className="flex flex-col items-start">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            p-3 m-2 rounded-xl transition-colors duration-200
            ${selectedTheme
              ? darkMode 
                ? 'hover:bg-black/20 text-white/80'
                : 'hover:bg-white/20 text-black/80'
              : darkMode
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'}
          `}
        >
          <Menu size={24} />
        </button>

        <div className="w-full px-2">
          <button
            onClick={onNewChat}
            className={`
              flex items-center justify-center gap-2 w-full p-3 rounded-xl
              transition-colors duration-200 bg-blue-600 font-semibold
              ${darkMode
                ? 'hover:bg-blue-700 text-blue-200 hover:text-blue-200'
                : 'hover:bg-blue-700 text-blue-200 hover:text-blue-200'}
            `}
          >
            <SquarePen size={24} />
            {!isCollapsed && <span className="truncate">New chat</span>}
          </button>
        </div>
      </div>

      {/* chat items */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden px-2 ${styles.chatScroll}`}>
        {!isCollapsed && chats.length > 0 && (
          <div className={`px-3 pt-5 ${darkMode ? 'text-gray-500' : 'text-gray-600'} font-bold`}>
            Recent
          </div>
        )}
        <AnimatePresence initial={false}>
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: '50%' }}
              animate={{ opacity: 1, x: '0%' }}
              exit={{ opacity: 0, x: '70%' }}
              transition={{ duration: 0.4 }}
            >
              <ChatItem
                chat={chat}
                isActive={currentChatId === chat.id}
                onSelect={onChatSelect}
                onRename={onRename}
                onDelete={onDelete}
                isCollapsed={isCollapsed}
                darkMode={darkMode}
                selectedTheme={selectedTheme}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatSidebar;