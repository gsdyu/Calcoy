import dynamic from 'next/dynamic';

const SharedLayout = dynamic(() => import('@/components/SharedLayout'), { ssr: false });
const CalendarApp = dynamic(() => import('@/components/Calendar/CalendarApp'), { ssr: false });

export default function Calendar() {
  return (
    <SharedLayout>
      <CalendarApp />
    </SharedLayout>
  );
}
