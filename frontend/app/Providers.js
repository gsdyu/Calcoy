'use client';

import { ThemeProvider } from '../src/contexts/ThemeContext';
import { UserProvider } from '../src/contexts/UserContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </ThemeProvider>
  );
}