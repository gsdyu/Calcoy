'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const CheckIns = () => {
  const { darkMode } = useTheme();

  //Later format for API to actually apply checkins (Checkins algorithm if somethhing pasts or currentltly during time event send cehckins)
  // If press yes meaning they did it push to stats COMPLETED (Can push to later) otherwise they press missed task -> Update 
  return (
    <div className={`p-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
      <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Check-ins</h3>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No check-ins available</p>
    </div>
  );
};

export default CheckIns;