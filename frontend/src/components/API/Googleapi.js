// 'use client' and importing necessary modules
import React from 'react';

const Googleapi = () => {
  // Redirect to initiate Google OAuth flow for Calendar access
  const handleGoogleCalendarAuth = async () => {
    try {
      window.location.href = 'http://localhost:5000/auth/google/calendar';
    } catch (error) {
      console.error('Error redirecting to Google Calendar OAuth:', error);
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

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const calendarData = await response.json();
      if (calendarData.items) {
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
