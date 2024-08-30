// Later connect to AI(Train to respond something on the lines of this (Can learn from completions))
const AIInsightsComponent = () => { 
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start space-x-2 text-white">
              <Calendar className="text-purple-400 mt-1 flex-shrink-0" />
              <span>You're most productive on Tuesdays. Consider scheduling important tasks for this day.</span>
            </li>
            <li className="flex items-start space-x-2 text-white">
              <AlertTriangle className="text-yellow-400 mt-1 flex-shrink-0" />
              <span>You often miss tasks scheduled after 4 PM. Try rescheduling these to earlier in the day.</span>
            </li>
            <li className="flex items-start space-x-2 text-white">
              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" />
              <span>Great job on completing all your high-priority tasks this week!</span>
            </li>
            <li className="flex items-start space-x-2 text-white">
              <Clock className="text-blue-400 mt-1 flex-shrink-0" />
              <span>You have 3 upcoming deadlines this week. Consider starting on them early.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    );
  };
  
