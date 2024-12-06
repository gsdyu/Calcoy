'use client'

import React, {useState, useEffect} from 'react';
import { Calendar, AlertTriangle, CheckCircle, Clock, Brain } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';


const AIInsightsComponent = ({ darkMode, insights, setInsights, view, fetchInsights, showNotification}) => { 

  const getInsightStyle = (label) => {
    let insightStyle;

    if (label == 'normal') {
      insightStyle = {icon: (<Calendar className="text-purple-400" size={20}/>), colorMain: 'purple', colorSub: 'pink'}
    } else if (label == 'warning') { 
      insightStyle = {icon: (<AlertTriangle className="text-yellow-400" size={20}/>), colorMain: 'yellow', colorSub: 'orange'}
    } else if (label == 'praise') { 
      insightStyle = {icon: (<CheckCircle className='text-green-400' size={20}/>), colorMain: 'green', colorSub: 'emerald'}
    } else if (label == 'reminder') {
      insightStyle = {icon: (<Clock className='text-blue-400' size={20}/>), colorMain: 'blue', colorSub: 'cyan'}
    } else {
      console.error(`AI insight given unknown type, ${type}`)
    }
    return insightStyle;
  }

  const renderInsightCard = (label, message) => {
    const insightStyle = getInsightStyle(label);
    if (!insightStyle) return;
    return(
      <li className={`p-4 rounded-xl transition-all duration-200 border
        bg-gradient-to-r ${darkMode ? `from-${insightStyle['colorMain']}-500/10 to-${insightStyle['colorSub']}-500/10 hover:from-${insightStyle['colorMain']}-500/20 hover:to-${insightStyle['colorSub']}-500/20 border-${insightStyle['colorMain']}-500/20` 
        : `from-${insightStyle['colorMain']}-50 to-${insightStyle['colorSub']}-50 hover:from-${insightStyle['colorMain']}-100 hover:to-${insightStyle['colorSub']}-100 border-${insightStyle['colorMain']}-200`}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full shrink-0
            ${darkMode ? `bg-${insightStyle['colorMain']}-500/20 border-${insightStyle['colorMain']}-500/30` : `bg-${insightStyle['colorMain']}-100 border-${insightStyle['colorMain']}-200`} border`}>
            {insightStyle['icon']}
          </div>
          <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {message}
          </div>
        </div>
      </li>
    )
  }

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
          {insights.map(insight => renderInsightCard(insight['label'],insight['message']))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default AIInsightsComponent;
