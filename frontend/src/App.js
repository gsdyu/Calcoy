import React from 'react';
import CalendarApp from './components/Calendar/CalendarApp';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';

const App = () => (
  <ThemeProvider>
    <UserProvider>
      <CalendarApp />
    </UserProvider>
  </ThemeProvider>
);

export default App;
