import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, SquarePen, Menu, MoreVertical, Pencil, Trash2 } from 'lucide-react';

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
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRenameClick = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setOpenMenuId(null);
  };

  const handleRename = (chatId) => {
    if (editTitle.trim()) {
      onRename?.(chatId, editTitle);
    }
    setEditingChatId(null);
  };

  return (
    <div 
      className={`
        flex flex-col border-l rounded-l-2xl
        transition-all duration-500 ease-in-out
        ${darkMode ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-200'}
        ${isCollapsed ? 'w-16' : 'w-72'}
      `}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          p-3 rounded-xl m-2 transition-colors duration-200
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
            ? 'hover:bg-gray-700 text-blue-400 hover:text-blue-400' 
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}
        `}
      >
        <SquarePen size={24} />
        {!isCollapsed && <span>Start new chat</span>}
      </button>

      <div className="flex-1 overflow-auto px-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`
              group relative flex items-center gap-2 p-3 my-1 rounded-xl
              transition-colors duration-200
              ${currentChatId === chat.id 
                ? (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                : 'hover:bg-opacity-50'}
              ${darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'}
            `}
          >
            <button
              onClick={() => onChatSelect(chat.id)}
              className="flex-1 flex items-center gap-2 min-w-0"
            >
              <MessageSquare size={20} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRename(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(chat.id);
                        if (e.key === 'Escape') setEditingChatId(null);
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
                      <span className="block truncate">{chat.title || 'New Chat'}</span>
                      <span className={`
                        text-xs truncate
                        ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                      `}>
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
                    setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                  }}
                  className={`
                    p-1 rounded-xl opacity-0 group-hover:opacity-100 
                    transition-all duration-200
                    ${darkMode 
                      ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                      : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}
                  `}
                >
                  <MoreVertical size={17} />
                </button>

                {openMenuId === chat.id && (
                  <div className={`
                    absolute right-0 mt-1 w-36 p-2 rounded-xl shadow-lg z-50
                    border transition-colors duration-200
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-200'}
                  `}>
                    <button
                      onClick={(e) => handleRenameClick(chat, e)}
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
                        onDelete?.(chat.id);
                        setOpenMenuId(null);
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
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;