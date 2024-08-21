'use client';

import { useState } from 'react';

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('Month');
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const handleDateChange = (date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleAddEvent = () => {
    setIsAddingEvent(true);
  };

  return {
    currentDate,
    view,
    isAddingEvent,
    handleDateChange,
    handleViewChange,
    handleAddEvent,
    setIsAddingEvent
  };
};