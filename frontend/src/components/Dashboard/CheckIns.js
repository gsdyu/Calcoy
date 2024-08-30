const RecentCheckIns = () => {
    const [events, setEvents] = useState([
      { id: 1, title: "Team Meeting", date: "2024-08-15 14:00", status: "pending" },
      { id: 2, title: "Project Deadline", date: "2024-08-10 17:00", status: "pending" },
      { id: 3, title: "Client Presentation", date: "2024-08-20 10:00", status: "pending" },
    ]);
    const [showLog, setShowLog] = useState(false);
    const [activityLog, setActivityLog] = useState([
      { timestamp: "2024-08-05 09:30", user: "Alice", action: "completed task", details: "Update presentation" },
      { timestamp: "2024-08-05 11:45", user: "Bob", action: "started new task", details: "Design new logo" },
      { timestamp: "2024-08-06 14:20", user: "You", action: "marked as completed", details: "Team Meeting" },
      { timestamp: "2024-08-07 10:00", user: "Charlie", action: "commented", details: "Great job on the presentation!" },
      { timestamp: "2024-08-07 16:30", user: "You", action: "marked as missed", details: "Client Call" },
    ]);
  
    const handleEventStatus = (id, status) => {
      setEvents(events.map(event => 
        event.id === id ? { ...event, status } : event
      ));
      const updatedEvent = events.find(event => event.id === id);
      setActivityLog([
        {
          timestamp: new Date().toLocaleString(),
          user: "You",
          action: `marked as ${status}`,
          details: updatedEvent.title
        },
        ...activityLog
      ]);
    };
  
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Check-ins</CardTitle>
            <button
              onClick={() => setShowLog(!showLog)}
              className="flex items-center space-x-2 bg-gray-700 text-white px-3 py-1 rounded-md"
            >
              <ClipboardList size={16} />
              <span>Activity Log</span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {!showLog ? (
            <ul className="space-y-3">
              {events.map(event => (
                <li key={event.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
                  <div>
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="text-sm text-gray-400">{new Date(event.date).toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEventStatus(event.id, 'completed')}
                      className="p-1 text-green-400 hover:text-green-300"
                      title="Mark as completed"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleEventStatus(event.id, 'missed')}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Mark as missed"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-3">Activity Log</h3>
              <ul className="space-y-2">
                {activityLog.map((log, index) => (
                  <li key={index} className="text-sm flex items-start space-x-2">
                    <span className="text-gray-400 whitespace-nowrap">{log.timestamp}</span>
                    <span className="text-blue-400">{log.user}</span>
                    <span className="text-white">{log.action}</span>
                    <span className="text-gray-300">"{log.details}"</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };