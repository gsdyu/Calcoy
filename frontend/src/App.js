import React from 'react';
import CalendarApp from './components/Calendar/CalendarApp';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import Head from 'next/head';

const App = ({ Component, pageProps }) => (
  <>
    <Head>
      <link rel="icon" href="/favicon.ico" />
      <title>My Calendar App</title>
    </Head>
    <ThemeProvider>
      <UserProvider>
        <CalendarApp />
      </UserProvider>
    </ThemeProvider>
  </>
);

export default App;
