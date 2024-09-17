// Later connect to AI(Train to respond something on the lines of this (Can learn from completions))
'use client'

import React from 'react';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AIInsightsComponent = ({ darkMode }) => { 
  return (
    <Card className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <CardHeader>
        <CardTitle className={darkMode ? 'text-gray-200' : 'text-gray-800'}>AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className={`flex items-start space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <Calendar className="text-purple-400 mt-1 flex-shrink-0" />
            <span>You're most productive on Tuesdays. Consider scheduling important tasks for this day.</span>
          </li>
          <li className={`flex items-start space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <AlertTriangle className="text-yellow-400 mt-1 flex-shrink-0" />
            <span>You often miss tasks scheduled after 4 PM. Try rescheduling these to earlier in the day.</span>
          </li>
          <li className={`flex items-start space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <CheckCircle className="text-green-400 mt-1 flex-shrink-0" />
            <span>Great job on completing all your high-priority tasks this week!</span>
          </li>
          <li className={`flex items-start space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <Clock className="text-blue-400 mt-1 flex-shrink-0" />
            <span>You have 3 upcoming deadlines this week. Consider starting on them early.</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default AIInsightsComponent;