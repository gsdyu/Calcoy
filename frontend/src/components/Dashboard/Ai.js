// Later connect to AI(Train to respond something on the lines of this (Can learn from completions))
'use client'

import React from 'react';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AIInsightsComponent = () => { 
  return (
    <Card className="mb-6 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200">AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-start space-x-2 text-gray-800 dark:text-gray-200">
            <Calendar className="text-purple-400 mt-1 flex-shrink-0" />
            <span>You're most productive on Tuesdays. Consider scheduling important tasks for this day.</span>
          </li>
          <li className="flex items-start space-x-2 text-gray-800 dark:text-gray-200">
            <AlertTriangle className="text-yellow-400 mt-1 flex-shrink-0" />
            <span>You often miss tasks scheduled after 4 PM. Try rescheduling these to earlier in the day.</span>
          </li>
          <li className="flex items-start space-x-2 text-gray-800 dark:text-gray-200">
            <CheckCircle className="text-green-400 mt-1 flex-shrink-0" />
            <span>Great job on completing all your high-priority tasks this week!</span>
          </li>
          <li className="flex items-start space-x-2 text-gray-800 dark:text-gray-200">
            <Clock className="text-blue-400 mt-1 flex-shrink-0" />
            <span>You have 3 upcoming deadlines this week. Consider starting on them early.</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default AIInsightsComponent;
  
