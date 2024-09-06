import React from 'react';
import SharedLayout from '@/components/SharedLayout';
import CalendarDashboard from '@/components/Dashboard/Dashboardapp';

export default function Dashboard() {
  return (
    <SharedLayout>
      <CalendarDashboard />
    </SharedLayout>
  );
}