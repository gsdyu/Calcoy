'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const TitleCalendar = ({activeCalendar}) => {
  const { darkMode } = useTheme();

  return (
    <div className={`p-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h2 className="text-xl font-bold mb-4">
        {activeCalendar === 0 && <div>Shared Calendar Content</div>}
        {activeCalendar === 1 && <div>Team Events Content</div>}
        {activeCalendar === 2 && <div>Family Calendar Content</div>}
        {activeCalendar === 3 && <div>Project Deadlines Content</div>}
        {activeCalendar === null && <div>Main Calendar View</div>}
      </h2>
    </div>
  );
};

export default TitleCalendar;
