'use client'

import React from 'react';
import { Calendar, AlertTriangle, CheckCircle, Clock, Brain } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AIInsightsComponent = ({ darkMode }) => { 
  return (
    <Card className={`h-full rounded-xl shadow-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white'} 
      border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <CardHeader className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <CardTitle className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'} flex items-center gap-2`}>
          <span className="text-2xl">🧠</span>
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ul className="space-y-4">
          <li className={`p-4 rounded-xl transition-all duration-200 border
            bg-gradient-to-r ${darkMode ? 'from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-500/20' 
            : 'from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full shrink-0
                ${darkMode ? 'bg-purple-500/20 border-purple-500/30' : 'bg-purple-100 border-purple-200'} border`}>
                <Calendar className="text-purple-400" size={20} />
              </div>
              <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                You're most productive on Tuesdays. Consider scheduling important tasks for this day.
              </div>
            </div>
          </li>

          <li className={`p-4 rounded-xl transition-all duration-200 border
            bg-gradient-to-r ${darkMode ? 'from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border-yellow-500/20' 
            : 'from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-yellow-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full shrink-0
                ${darkMode ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-100 border-yellow-200'} border`}>
                <AlertTriangle className="text-yellow-400" size={20} />
              </div>
              <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                You often miss tasks scheduled after 4 PM. Try rescheduling these to earlier in the day.
              </div>
            </div>
          </li>

          <li className={`p-4 rounded-xl transition-all duration-200 border
            bg-gradient-to-r ${darkMode ? 'from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-500/20' 
            : 'from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full shrink-0
                ${darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-100 border-green-200'} border`}>
                <CheckCircle className="text-green-400" size={20} />
              </div>
              <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Great job on completing all your high-priority tasks this week!
              </div>
            </div>
          </li>

          <li className={`p-4 rounded-xl transition-all duration-200 border
            bg-gradient-to-r ${darkMode ? 'from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-500/20' 
            : 'from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full shrink-0
                ${darkMode ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-100 border-blue-200'} border`}>
                <Clock className="text-blue-400" size={20} />
              </div>
              <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                You have 3 upcoming deadlines this week. Consider starting on them early.
              </div>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default AIInsightsComponent;
