const Dashboard = () => {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <DashboardHeader />
          <div className="grid grid-cols-1 gap-6">
            <TaskCompletionComponent />
            <AIInsightsComponent />
            <RecentCheckIns />
          </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;