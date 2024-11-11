import dynamic from 'next/dynamic';
const SharedLayout = dynamic(() => import('@/components/SharedLayout'), { ssr: false });

const CalendarDashboard = dynamic(() => import('@/components/Dashboard/Dashboardapp'), { ssr: false });

export default function Dashboard() {
  return (
    <SharedLayout>
      <CalendarDashboard />
    </SharedLayout>
  );
}
