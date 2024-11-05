'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, LogOut, ChevronDown, X } from 'lucide-react';

const TitleCalendar = ({ activeCalendar, onInvite, onLeave }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const dropdownRef = useRef(null);
  const confirmModalOverlayRef = useRef(null);
  const inviteModalOverlayRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

  const openConfirmModal = () => {
    setDropdownOpen(false);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => setShowConfirmModal(false);

  const openInviteModal = () => {
    setDropdownOpen(false);
    setShowInviteModal(true);
  };

  const closeInviteModal = () => setShowInviteModal(false);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutsideDropdown);
    return () => document.removeEventListener('mousedown', handleClickOutsideDropdown);
  }, []);

  // Close confirm modal if clicking outside of it
  useEffect(() => {
    const handleClickOutsideConfirmModal = (event) => {
      if (confirmModalOverlayRef.current && confirmModalOverlayRef.current === event.target) {
        closeConfirmModal();
      }
    };
    if (showConfirmModal) {
      document.addEventListener('mousedown', handleClickOutsideConfirmModal);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideConfirmModal);
  }, [showConfirmModal]);

  // Close invite modal if clicking outside of it
  useEffect(() => {
    const handleClickOutsideInviteModal = (event) => {
      if (inviteModalOverlayRef.current && inviteModalOverlayRef.current === event.target) {
        closeInviteModal();
      }
    };
    if (showInviteModal) {
      document.addEventListener('mousedown', handleClickOutsideInviteModal);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideInviteModal);
  }, [showInviteModal]);

  return (
    <div className="relative p-4 flex flex-col items-center">
      {activeCalendar && activeCalendar.name ? (
        <div
          className="flex items-center justify-between cursor-pointer hover:text-gray-400 w-full max-w-xs relative z-50"
          onClick={toggleDropdown}
        >
          <h1 className="text-2xl font-semibold text-center flex-grow">
            {activeCalendar.name}
          </h1>
          <ChevronDown size={20} className="text-gray-400" />
        </div>
      ) : (
        <h2 className="text-xl font-bold">Main Calendar View</h2>
      )}

      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-16 mt-2 py-2 w-40 bg-black text-gray-200 rounded-lg shadow-lg border border-gray-700 z-50"
        >
          <button
            onClick={openInviteModal}
            className="flex items-center px-4 py-2 w-full text-left hover:bg-gray-700 transition-colors duration-150"
          >
            <UserPlus size={16} className="mr-2 text-blue-500" />
            Invite People
          </button>

          <div className="border-t my-2 border-gray-600"></div>

          <button
            onClick={openConfirmModal}
            className="flex items-center px-4 py-2 w-full text-left text-red-500 hover:bg-gray-700 transition-colors duration-150"
          >
            <LogOut size={16} className="mr-2" />
            Leave Server
          </button>
        </div>
      )}

      {/* Confirmation Modal for Leaving Server */}
      {showConfirmModal && (
        <div ref={confirmModalOverlayRef} className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Leave '{activeCalendar.name}'</h2>
            <p className="mb-4">
              Are you sure you want to leave {activeCalendar.name}? You won't be able to rejoin this server unless you are re-invited.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onLeave(activeCalendar.id);
                  closeConfirmModal();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
              >
                Leave Server
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div ref={inviteModalOverlayRef} className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Invite Friends</h2>
              <button onClick={closeInviteModal} className="text-gray-400 hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <p className="mb-4">Share this invite link with your friends to join the calendar:</p>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={`https://timewise.com/invite/${activeCalendar.id}`}
                readOnly
                className="w-full p-2 bg-gray-700 text-gray-200 rounded"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://timewise.com/invite/${activeCalendar.id}`);
                  alert('Link copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy Link
              </button>
            </div>
        
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleCalendar;
