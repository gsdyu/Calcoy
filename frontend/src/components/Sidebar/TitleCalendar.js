'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, LogOut, ChevronDown, X, Copy, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const TitleCalendar = ({ activeCalendar, onInvite, onLeave }) => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const dropdownRef = useRef(null);
  const headerRef = useRef(null);
  const confirmModalOverlayRef = useRef(null);
  const inviteModalOverlayRef = useRef(null);
  const exportModalOverlayRef = useRef(null);

  const handleHeaderClick = () => {
    setIsOpen(!isOpen);
  };

  const handleCopyLink = async () => {
    navigator.clipboard.writeText(`https://timewise.com/invite/${activeCalendar.invite_link}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const generateICS = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/calendar/export`, {
      credentials: 'include',
    });
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.getElementById('icsLink');
    link.href = blobUrl;
    link.download = 'timewise_calendar';
    link.textContent = blobUrl.replace('blob:','');
    link.addEventListener('click', () => {
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    })
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !headerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
      if (confirmModalOverlayRef.current === event.target) {
        setShowConfirmModal(false);
      }
      if (inviteModalOverlayRef.current === event.target) {
        setShowInviteModal(false);
      }
      if (exportModalOverlayRef.current === event.target) {
        setShowExportModal(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseStyles = {
    header: `flex items-center justify-between cursor-pointer w-full max-w-xs relative z-50 px-2 py-1 
      ${darkMode 
        ? 'hover:bg-gray-800/40 text-gray-100' 
        : 'hover:bg-gray-100 text-gray-900'} 
      rounded-md transition-colors duration-200`,
    
    dropdown: `absolute top-12 mt-1 py-1 w-48 rounded-2xl shadow-lg z-50 overflow-hidden
      ${darkMode 
        ? 'bg-gray-900 text-gray-200 border border-gray-800/10' 
        : 'bg-white text-gray-800 border border-gray-200 shadow-md'}`,
    
    dropdownItem: `flex items-center px-3 py-2 w-full text-left 
      ${darkMode 
        ? 'hover:bg-gray-800/40' 
        : 'hover:bg-gray-100'} 
      transition-colors duration-150`,
    
    modalOverlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center',
    
    modal: `p-6 rounded-3xl shadow-2xl max-w-md w-full 
      ${darkMode 
        ? 'bg-gray-900 text-gray-100 border border-gray-800/10' 
        : 'bg-white text-gray-900 border border-gray-200'}`
  };

  return (
    <div className="relative p-4 flex flex-col items-center">
      <div 
        ref={headerRef}
        className={baseStyles.header} 
        onClick={handleHeaderClick}
      >
        <h1 className="text-lg font-medium text-center flex-grow">
          {activeCalendar?.name || 'Main Calendar'}
        </h1>
        {isOpen ? (
          <X size={16} className={darkMode ? "text-gray-400" : "text-gray-500"} />
        ) : (
          <ChevronDown size={16} className={darkMode ? "text-gray-400" : "text-gray-500"} />
        )}
      </div>

      {isOpen && (
        <div ref={dropdownRef} className={baseStyles.dropdown}>
          {activeCalendar ? (
            <>
              <button
                onClick={() => {
                  setShowInviteModal(true);
                  setIsOpen(false);
                }}
                className={baseStyles.dropdownItem}
              >
                <UserPlus size={16} className="mr-2 text-blue-500" />
                <span className="font-medium">Invite People</span>
              </button>

              <div className={darkMode ? "border-t border-gray-800/10" : "border-t border-gray-200"}></div>

              <button
                onClick={() => {
                  setShowConfirmModal(true);
                  setIsOpen(false);
                }}
                className={`${baseStyles.dropdownItem} text-red-500`}
              >
                <LogOut size={16} className="mr-2" />
                <span className="font-medium">Leave Server</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setShowExportModal(true);
                setIsOpen(false);
                generateICS();
              }}
              className={baseStyles.dropdownItem}
            >
              <UserPlus size={16} className="mr-2 text-blue-500" />
              <span className="font-medium">Export Calendar</span>
            </button>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div ref={confirmModalOverlayRef} className={baseStyles.modalOverlay}>
          <div className={baseStyles.modal}>
            <h2 className="text-xl font-semibold mb-4">Leave '{activeCalendar.name}'</h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to leave {activeCalendar.name}? You won't be able to rejoin this server unless you are re-invited.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`px-6 py-2 rounded-full 
                  ${darkMode 
                    ? 'border border-gray-700 hover:bg-gray-800/50' 
                    : 'border border-gray-200 hover:bg-gray-100'} 
                  transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onLeave(activeCalendar.id);
                  setShowConfirmModal(false);
                }}
                className="px-8 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 
                  hover:from-red-600 hover:to-red-700 text-white transition-colors"
              >
                Leave Server
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div ref={inviteModalOverlayRef} className={baseStyles.modalOverlay}>
          <div className={baseStyles.modal}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Invite Friends</h2>
              <button 
                onClick={() => setShowInviteModal(false)} 
                className={`p-2 rounded-full transition-colors
                  ${darkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Share this invite link with your friends to join the calendar:
            </p>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={`https://timewise.com/invite/${activeCalendar.invite_link}`} 
                readOnly
                className={`w-full p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  ${darkMode 
                    ? 'bg-gray-800/50 text-gray-200 border border-gray-700' 
                    : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
              />
              <button
                onClick={handleCopyLink}
                className={`p-3 rounded-full transition-colors duration-150 text-white
                  ${copySuccess 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'}`}
              >
                {copySuccess ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div ref={exportModalOverlayRef} className={baseStyles.modalOverlay}>
          <div className={baseStyles.modal}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Export Calendar</h2>
              <button 
                onClick={() => setShowExportModal(false)} 
                className={`p-2 rounded-full transition-colors
                  ${darkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Use this ics file to export ALL your timewise events from Main Calendar:
            </p>
            <div className="flex items-center space-x-3">
              <a 
                href="123123" 
                id="icsLink"
                className={`w-full p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  ${darkMode 
                    ? 'bg-gray-800/50 text-gray-200 border border-gray-700' 
                    : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
              >
                {generateICS} 
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleCalendar;
