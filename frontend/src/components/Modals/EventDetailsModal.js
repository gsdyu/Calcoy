'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Edit, Trash, Check, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const EventDetailsModal = ({ event, onClose, onEdit, onDelete, onTaskComplete, triggerRect, view, getEventColor }) => {
  const { darkMode } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [position, setPosition] = useState({ left: -9999, top: -9999 }); // Start offscreen
  const [colorBGList, setColorBGList] = useState([]);
  const modalRef = useRef(null);
  const isTask = event?.calendar === 'Task';
  const isCompleted = event?.completed;

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // for the color dots on modal
  useEffect(() => {
    if (!event) return
    console.log(event)
    const {origColorBGList} = getEventColor(event);
    setColorBGList(origColorBGList);
  }, [event, getEventColor])

  // Handle positioning
  useEffect(() => {
    if (!triggerRect || !modalRef.current) return;

    const modalRect = modalRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 384; // w-96 = 24rem = 384px
    const modalHeight = modalRect.height || 300; // Use actual height if available

    if (view === 'day') {
      // For day view, attempt to center horizontally near the event
      let left = triggerRect.left + (triggerRect.width / 2) - (modalWidth / 2);
      let top = triggerRect.top + 40; // Position slightly below the event

      // Keep modal within viewport bounds
      left = Math.max(16, Math.min(left, viewportWidth - modalWidth - 16));
      
      // If modal would go below viewport, position it above the event
      if (top + modalHeight > viewportHeight - 16) {
        top = Math.max(16, triggerRect.top - modalHeight - 16);
      }

      setPosition({ left, top });
    } else {
      // For week/month views, position to the side with most space
      const spaceOnRight = viewportWidth - triggerRect.right - 16;
      const spaceOnLeft = triggerRect.left - 16;
      
      let left;
      if (spaceOnRight >= modalWidth) {
        // Position to the right if there's enough space
        left = triggerRect.right + 16;
      } else if (spaceOnLeft >= modalWidth) {
        // Position to the left if there's enough space
        left = triggerRect.left - modalWidth - 16;
      } else {
        // Center in viewport if no space on either side
        left = (viewportWidth - modalWidth) / 2;
      }

      // Ensure modal stays within vertical bounds
      let top = triggerRect.top;
      if (top + modalHeight > viewportHeight - 16) {
        top = Math.max(16, viewportHeight - modalHeight - 16);
      }

      setPosition({ left, top });
    }
  }, [triggerRect, view]);

  // Handle escape key only - remove click outside handling
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  if (!event) return null;

  const renderColorDot = (color) => ( 
    <div className={`w-6 h-6 rounded-full mr-2 ${color} `}/>
  ) 

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(event.id);
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
      setDeleteError('Failed to delete the event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTaskComplete = async () => {
    try {
      await onTaskComplete(event.id, !isCompleted);
    } catch (error) {
      console.error('Error updating task completion:', error);
    }
  };

  return (
    <>
      {/* Invisible overlay for empty area clicks only */}
    <div 
        className="fixed inset-0 z-40 pointer-events-none"
      >
        <div 
          className="absolute inset-0 pointer-events-auto"
          onClick={(e) => {
            // Only close if clicking directly on the overlay (not events or modal)
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        />
      </div>
      
      {/* Modal */}
      <div 
        ref={modalRef}
      className="fixed z-50"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: 'none'
      }}
    >
      <div 
        className={`${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
        } rounded-xl w-96 overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-xl font-medium ${isTask && isCompleted ? 'line-through opacity-50' : ''}`}>
            {isTask && <Check className="inline-block w-5 h-5 mr-2 text-blue-500" />}
            {event.title}
          </h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onEdit(event)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <Edit size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
            {!event.isHoliday && (
              <button 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete this ${isTask ? 'task' : 'event'}?`)) {
                    handleDelete();
                  }
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                disabled={isDeleting}
              >
                <Trash size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className={`space-y-3 ${isTask && isCompleted ? 'opacity-50' : ''}`}>
            {/* Color Dots */}
            <div className="flex space-x-2">
              {colorBGList?colorBGList.map(color=>renderColorDot(color)):''} 
            </div>
            <p className="text-sm"><strong>Date:</strong> {event.date}</p>
            <p className="text-sm"><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
            {event.location && (
              <p className="text-sm"><strong>Location:</strong> {event.location}</p>
            )}
            {event.description && (
              <p className="text-sm"><strong>Description:</strong> {event.description}</p>
            )}
          </div>

          {deleteError && (
            <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              <AlertTriangle size={16} className="inline mr-2" />
              {deleteError}
            </div>
          )}

          {/* Task completion button */}
          {isTask && (
            <button
              onClick={handleTaskComplete}
              className={`mt-4 w-full py-2 px-4 rounded-lg border ${
                isCompleted
                  ? 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  : 'border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900'
              } transition-colors duration-200`}
            >
              {isCompleted ? 'Mark uncompleted' : 'Mark completed'}
            </button>
          )}
        </div>
      </div>
    </div>
  </>
  );
};

export default EventDetailsModal;
