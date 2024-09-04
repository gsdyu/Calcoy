import React from 'react';
import SharedLayout from '@/components/SharedLayout';
import CalendarApp from '@/components/Calendar/CalendarApp';

export default function Calendar() {
  return (
    <SharedLayout>
      <CalendarApp />
    </SharedLayout>
  );
}