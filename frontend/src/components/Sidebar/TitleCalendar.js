'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, LogOut, ChevronDown, X, Copy, Check } from 'lucide-react';

const TitleCalendar = ({ activeCalendar, onInvite, onLeave }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef(null);
  const confirmModalOverlayRef = useRef(null);
  const inviteModalOverlayRef = useRef(null);

  const handleHeaderClick = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const handleCopyLink = async () => {
    navigator.clipboard.writeText(`https://timewise.com/invite/${activeCalendar.invite_link}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (confirmModalOverlayRef.current === event.target) {
        setShowConfirmModal(false);
      }
      if (inviteModalOverlayRef.current === event.target) {
        setShowInviteModal(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative p-4 flex flex-col items-center">
      {activeCalendar && activeCalendar.name ? (
        <div
          className="flex items-center justify-between cursor-pointer w-full max-w-xs relative z-50 px-2 py-1 hover:bg-gray-800/40 rounded-md transition-colors duration-200"
          onClick={handleHeaderClick}
        >
          <h1 className="text-lg font-medium text-center flex-grow text-gray-100">
            {activeCalendar.name}
          </h1>
          {dropdownOpen ? (
            <X size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      ) : (
        <h2 className="text-xl font-bold">Main Calendar View</h2>
      )}

      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-12 mt-1 py-1 w-48 bg-gray-900 text-gray-200 rounded-2xl shadow-lg border border-gray-800/10 z-50 overflow-hidden"
        >
          <button
            onClick={() => {
              setShowInviteModal(true);
              setDropdownOpen(false);
            }}
            className="flex items-center px-3 py-2 w-full text-left hover:bg-gray-800/40 transition-colors duration-150"
          >
            <UserPlus size={16} className="mr-2 text-blue-400" />
            <span className="font-medium">Invite People</span>
          </button>

          <div className="border-t border-gray-800/10"></div>

          <button
            onClick={() => {
              setShowConfirmModal(true);
              setDropdownOpen(false);
            }}
            className="flex items-center px-3 py-2 w-full text-left text-red-400 hover:bg-gray-800/40 transition-colors duration-150"
          >
            <LogOut size={16} className="mr-2" />
            <span className="font-medium">Leave Server</span>
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div ref={confirmModalOverlayRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-gray-900 text-gray-100 p-6 rounded-3xl shadow-2xl max-w-md w-full border border-gray-800/10">
            <h2 className="text-xl font-semibold mb-4">Leave '{activeCalendar.name}'</h2>
            <p className="mb-6 text-gray-400">
              Are you sure you want to leave {activeCalendar.name}? You won't be able to rejoin this server unless you are re-invited.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2 rounded-full border border-gray-700 hover:bg-gray-800/50 transition-colors"
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
        <div ref={inviteModalOverlayRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-gray-900 text-gray-100 p-6 rounded-3xl shadow-2xl max-w-md w-full border border-gray-800/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Invite Friends</h2>
              <button 
                onClick={() => setShowInviteModal(false)} 
                className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-800/40 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-gray-400">Share this invite link with your friends to join the calendar:</p>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={`https://timewise.com/invite/${activeCalendar.invite_link}`} 
                readOnly
                className="w-full p-3 rounded-full bg-gray-800/50 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={handleCopyLink}
                className={`p-3 rounded-full transition-colors duration-150 
                  ${copySuccess 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  } text-white`}
              >
                {copySuccess ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleCalendar;
