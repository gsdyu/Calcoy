'use client';

import React from 'react';

const Googleapi = () => {
  // Redirect to start Google OAuth flow for importing Calendar events
  const handleGoogleCalendarAuth = async () => {
    try {
      window.location.href = 'http://localhost:5000/auth/google/calendar'; // Use the new calendar-specific route
    } catch (error) {
      console.error('Error authenticating with Google Calendar:', error);
    }
  };

  // Fetch events from Google Calendar using the access token
  const fetchAndSaveGoogleCalendarEvents = async (accessToken) => {
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const calendarData = await response.json();
      if (calendarData.items) {
        // Return the fetched events to the frontend
        return calendarData.items;
      } else {
        console.log('No events found in the Google Calendar');
        return [];
      }
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return [];
    }
  };

  return { handleGoogleCalendarAuth, fetchAndSaveGoogleCalendarEvents };
};

export default Googleapi;
