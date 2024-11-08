import React, { useState, useRef, useEffect } from 'react';
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
  darkMode
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

  return (
    <div
      className={`
        relative group flex items-center gap-2 p-3 my-1 rounded-xl
        transition-colors duration-200
        ${isActive
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
        className="flex-1 flex items-center gap-2 min-w-0"
      >
        <MessageSquare size={20} />
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
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
                  w-full px-2 py-1 rounded-lg
                  ${darkMode
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
              <>
                <span className="block truncate">
                  {chat.title || 'New Chat'}
                </span>
                <span
                  className={`
                    text-xs truncate
                    ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                  `}
                >
                  {new Date(chat.timestamp).toLocaleDateString()}
                </span>
              </>
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
              ${darkMode
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
                ${darkMode
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
                  ${darkMode
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
};

const ChatSidebar = ({
  currentChatId,
  onChatSelect,
  onNewChat,
  onRename,
  onDelete,
  chats = [],
  darkMode
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`
        flex flex-col border-l 
        transition-all duration-300 ease-in-out
        ${darkMode ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-200'}
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
            ${darkMode
              ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}
          `}
        >
          <Menu size={24} />
        </button>

        <button
          onClick={onNewChat}
          className={`
            flex items-center gap-2 m-2 p-3 rounded-xl
            transition-colors duration-200
            ${darkMode
              ? 'hover:bg-gray-700 text-blue-500 hover:text-blue-500'
              : 'hover:bg-gray-100 text-blue-500 hover:text-blue-500'}
          `}
        >
          <SquarePen size={24} />
          {!isCollapsed && <span>New chat</span>}
        </button>
      </div>

      {/* chat items */}
      <div className="flex-1 overflow-auto px-2">
        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isActive={currentChatId === chat.id}
            onSelect={onChatSelect}
            onRename={onRename}
            onDelete={onDelete}
            isCollapsed={isCollapsed}
            darkMode={darkMode}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
