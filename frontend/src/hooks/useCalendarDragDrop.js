// hooks/useCalendarDragDrop.js
import { useState } from 'react';

const emptyImage = new Image();
emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export const useCalendarDragDrop = ({ 
  onEventUpdate, 
  darkMode = false,
  view = 'month', // 'month', 'week', or 'day'
  cellHeight = 60, // Height in pixels for time-based views
}) => {
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dropPreview, setDropPreview] = useState(null);

  const getClosestTimeSlot = (y, element) => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const relativeY = y - rect.top;
    const halfHourBlocks = Math.round(relativeY / (cellHeight / 2));
    const hours = Math.floor(halfHourBlocks / 2);
    const minutes = (halfHourBlocks % 2) * 30;
    return {
      hours: Math.max(0, Math.min(23, hours)),
      minutes: minutes
    };
  };

  const handleDragStart = (e, eventId) => {
    setDraggedEvent(eventId);
    
    // Set the drag data
    e.dataTransfer.setData('text/plain', JSON.stringify({ eventId }));
    
    // Use empty image as drag ghost
    e.dataTransfer.setDragImage(emptyImage, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
    
    // Set opacity on dragged element
    e.currentTarget.style.opacity = '0.4';
    e.currentTarget.style.transition = 'opacity 0.2s';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedEvent(null);
    setDragOverColumn(null);
    setDropPreview(null);
  };

  const handleDragOver = (e, columnIndex) => {
    e.preventDefault();
    
    const dropTarget = e.currentTarget;
    
    if (view !== 'month') {
      setDragOverColumn(columnIndex);
      
      // Calculate time slot for week/day views
      const timeSlot = getClosestTimeSlot(e.clientY, dropTarget);
      if (timeSlot) {
        setDropPreview({
          columnIndex,
          hours: timeSlot.hours,
          minutes: timeSlot.minutes
        });
      }
    }
    
    // Add visual feedback
    dropTarget.style.transition = 'background-color 0.2s';
    dropTarget.style.backgroundColor = darkMode 
      ? 'rgba(59, 130, 246, 0.2)' 
      : 'rgba(59, 130, 246, 0.1)';
  };

  const handleDragLeave = (e) => {
    // Reset styling
    const dropTarget = e.currentTarget;
    dropTarget.style.backgroundColor = '';
    
    if (view !== 'month') {
      setDragOverColumn(null);
      setDropPreview(null);
    }
  };

  const handleDrop = (e, date, hour = null) => {
    e.preventDefault();
    const { eventId } = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    // Reset styling
    const dropTarget = e.currentTarget;
    dropTarget.style.backgroundColor = '';
    
    // Create new date with hour if provided (for week/day views)
    let newDate = new Date(date);
    
    if (view !== 'month' && dropPreview) {
      // Use the preview time for week/day views
      newDate.setHours(dropPreview.hours);
      newDate.setMinutes(dropPreview.minutes);
    } else if (hour !== null) {
      // Fallback to provided hour
      newDate.setHours(hour);
      newDate.setMinutes(0);
    }
    
    // Update event
    onEventUpdate(eventId, newDate);

    // Success feedback
    dropTarget.style.transition = 'background-color 0.3s';
    dropTarget.style.backgroundColor = darkMode 
      ? 'rgba(59, 130, 246, 0.5)' 
      : 'rgba(59, 130, 246, 0.2)';
    setTimeout(() => {
      dropTarget.style.backgroundColor = '';
    }, 300);

    setDraggedEvent(null);
    setDragOverColumn(null);
    setDropPreview(null);
  };

  // Props for draggable elements
  const getDragHandleProps = (eventId) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, eventId),
    onDragEnd: handleDragEnd,
  });

  // Props for drop target elements
  const getDropTargetProps = (date, columnIndex = null, hour = null) => ({
    onDragOver: (e) => handleDragOver(e, columnIndex),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, date, hour),
  });

  return {
    draggedEvent,
    dragOverColumn,
    dropPreview,
    getDragHandleProps,
    getDropTargetProps,
  };
};