'use client';

import React, { useState } from 'react';
import { X, Edit, Trash, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const EventDetailsModal = ({ event, onClose, onEdit, onDelete }) => {
  const { darkMode } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  if (!event) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(event.id);
      onClose(); // Close the modal after successful deletion
    } catch (error) {
      console.error('Error deleting event:', error);
      setDeleteError('Failed to delete the event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-6 rounded-lg w-96`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{event.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div 
          className="mb-4 cursor-pointer hover:bg-opacity-10 hover:bg-blue-500 p-2 rounded transition-colors duration-200"
          onClick={() => onEdit(event)}
        >
          <p className="text-sm mb-1"><strong>Date:</strong> {event.date}</p>
          <p className="text-sm mb-1"><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
          {event.location && <p className="text-sm mb-1"><strong>Location:</strong> {event.location}</p>}
          {event.description && <p className="text-sm mb-1"><strong>Description:</strong> {event.description}</p>}
          <p className="text-sm text-blue-500 mt-2">Click to edit</p>
        </div>
        {deleteError && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            <AlertTriangle size={16} className="inline mr-2" />
            {deleteError}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          {isDeleting ? (
            <button
              className={`flex items-center px-4 py-2 rounded ${
                darkMode ? 'bg-gray-600' : 'bg-gray-400'
              } text-white cursor-not-allowed`}
              disabled
            >
              Deleting...
            </button>
          ) : (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this event?')) {
                  handleDelete();
                }
              }}
              className={`flex items-center px-4 py-2 rounded ${
                darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
              } text-white`}
            >
              <Trash size={16} className="mr-2" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;