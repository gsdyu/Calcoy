import { useState } from 'react';

export const useCalendarDragDrop = ({ 
  onEventUpdate, 
  darkMode = false,
  view = 'month',
  cellHeight = 60,
  emptyImage
}) => {
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dropPreview, setDropPreview] = useState(null);  

  const getTimePosition = (y, dayElement) => {
    if (!dayElement || view !== 'week') return null;
    
    const rect = dayElement.getBoundingClientRect();
    const gridContainer = dayElement.closest('.time-grid-container');
    const scrollTop = gridContainer?.scrollTop || 0;
    
    const containerTop = gridContainer?.getBoundingClientRect().top || 0;
    const relativeY = y - containerTop + scrollTop - 40;
    
    // Calculate total minutes more precisely
    const totalMinutes = (relativeY / cellHeight) * 60;
    
    // Round hours down to get the base hour
    const hours = Math.floor(totalMinutes / 60);
    
    // Calculate minutes and snap to nearest 15
    const rawMinutes = totalMinutes % 60;
    // This will snap to 0, 15, 30, or 45
    const minutes = Math.round(rawMinutes / 15) * 15;
    
    // If minutes is 60, we need to increment the hour
    if (minutes === 60) {
      return {
        hours: Math.min(hours + 1, 23),
        minutes: 0
      };
    }
    
    return {
      hours: Math.max(0, Math.min(hours, 23)),
      minutes: minutes
    };
  };

  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    
    e.dataTransfer.setData('text/plain', JSON.stringify({ 
      eventId: event.id,
      isAllDay: event.isAllDay
    }));
    e.currentTarget.style.opacity = '0.4';
    
    e.dataTransfer.setDragImage(emptyImage, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnIndex, date) => {
    e.preventDefault();
    
    if (!draggedEvent) return;

    if (view === 'week' && !draggedEvent.isAllDay) {
      const timePosition = getTimePosition(e.clientY, e.currentTarget);
      if (timePosition) {
        const { hours, minutes } = timePosition;
        const newDate = new Date(date);
        newDate.setHours(hours, minutes);

        // Preserve event duration
        const duration = draggedEvent.duration || 
          (new Date(draggedEvent.end_time) - new Date(draggedEvent.start_time)) / (1000 * 60);

        let endDate = new Date(newDate);
        endDate.setMinutes(endDate.getMinutes() + duration);

        setDropPreview({
          ...draggedEvent,
          start_time: newDate.toISOString(),
          end_time: endDate.toISOString(),
          columnIndex
        });
      }
    } else {
      // Month view or all-day event behavior
      setDropPreview({
        ...draggedEvent,
        date: date,
        columnIndex
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
    const { eventId, isAllDay } = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    const dropTarget = e.currentTarget;
    dropTarget.style.backgroundColor = '';
    
    let newDate = new Date(date);

    if (view === 'week' && !isAllDay) {
      const timePosition = getTimePosition(e.clientY, e.currentTarget);
      if (timePosition) {
        const { hours, minutes } = timePosition;
        newDate.setHours(hours, minutes);
        
        // Pass the time position to onEventUpdate
        onEventUpdate(eventId, newDate, timePosition);
      } else if (hour !== null) {
        newDate.setHours(hour);
        onEventUpdate(eventId, newDate);
      }
    } else if (hour !== null) {
      // For month view or all-day events, use provided hour if available
      newDate.setHours(hour);
      onEventUpdate(eventId, newDate);
    } else {
      onEventUpdate(eventId, newDate);
    }

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

  const getDragHandleProps = (event) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, event),
    onDragEnd: handleDragEnd,
  });

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