// hooks/useCalendarDragDrop.js
import { useState } from 'react';

export const useCalendarDragDrop = ({ 
  onEventUpdate, 
  darkMode = false,
  view = 'month',
  cellHeight = 60,
}) => {
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dropPreview, setDropPreview] = useState(null);  

  const handleDragStart = (e, event) => {  // Changed to accept full event
    setDraggedEvent(event);
    
    e.dataTransfer.setData('text/plain', JSON.stringify({ eventId: event.id }));
    e.currentTarget.style.opacity = '0.4';
    // Use empty image to hide the drag ghost
    const emptyImage = new Image();
    emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    e.dataTransfer.setDragImage(emptyImage, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnIndex, date) => {
    e.preventDefault();
    
    if (draggedEvent) {
      setDropPreview({
        ...draggedEvent,
        day: columnIndex,
        date: date
      });
    }
    
    setDragOverColumn(columnIndex);
    
    const dropTarget = e.currentTarget;
    dropTarget.style.transition = 'background-color 0.2s';
    dropTarget.style.backgroundColor = darkMode 
      ? 'rgba(59, 130, 246, 0.2)' 
      : 'rgba(59, 130, 246, 0.1)';
  };

  const handleDragLeave = (e) => {
    const dropTarget = e.currentTarget;
    dropTarget.style.backgroundColor = '';
    setDragOverColumn(null);
    setDropPreview(null);  
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedEvent(null);
    setDragOverColumn(null);
    setDropPreview(null);  
  };

  const handleDrop = (e, date, hour = null) => {
    e.preventDefault();
    const { eventId } = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    const dropTarget = e.currentTarget;
    dropTarget.style.backgroundColor = '';
    
    let newDate = new Date(date);
    if (hour !== null) {
      newDate.setHours(hour);
    }
    
    onEventUpdate(eventId, newDate);

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
  const getDragHandleProps = (event) => ({  // Changed to accept full event
    draggable: true,
    onDragStart: (e) => handleDragStart(e, event),
    onDragEnd: handleDragEnd,
  });

  // Props for drop target elements
  const getDropTargetProps = (date, columnIndex = null, hour = null) => ({
    onDragOver: (e) => handleDragOver(e, columnIndex, date),
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