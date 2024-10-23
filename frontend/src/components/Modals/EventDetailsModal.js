'use client';

import React, { useState } from 'react';
import { X, Edit, Trash, Check, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const EventDetailsModal = ({ event, onClose, onEdit, onDelete, onTaskComplete }) => {
  const { darkMode } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const isTask = event?.calendar === 'Task';
  const isCompleted = event?.completed;

  if (!event) return null;

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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div 
        className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-xl w-96 overflow-hidden shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with all buttons */}
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
                  ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  : 'border-blue-500 text-blue-500 hover:bg-blue-50'
              } transition-colors duration-200`}
            >
              {isCompleted ? 'Mark uncompleted' : 'Mark completed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;