const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fetch = require('node-fetch');
const express = require('express');
const app = express(); // Assuming this is your main file

// Helper function to find or create a user by email
const findOrCreateUser = async (email, pool) => {
  let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  let user = userResult.rows[0];

  if (!user) {
    const newUserResult = await pool.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING *',
      [email]
    );
    user = newUserResult.rows[0];
  }
  return user;
};

// Helper function to fetch and save calendar events to PostgreSQL
const fetchAndSaveGoogleCalendarEvents = async (accessToken, userId, pool) => {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!response.ok) throw new Error('Failed to fetch calendar events');
  const calendarData = await response.json();
  const events = calendarData.items.map(event => ({
    user_id: userId,
    title: event.summary || 'No Title',
    description: event.description || '',
    start_time: event.start.dateTime,
    end_time: event.end.dateTime,
    location: event.location || '',
    calendar: 'Google',
    time_zone: event.start.timeZone || 'UTC'
  }));

  for (const event of events) {
    await pool.query(
      `INSERT INTO events (user_id, title, description, start_time, end_time, location, calendar, time_zone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       ON CONFLICT (user_id, title, start_time, end_time, location) DO NOTHING`, 
      [event.user_id, event.title, event.description, event.start_time, event.end_time, event.location, event.calendar, event.time_zone]
    );
  }
};

// Set up the Google OAuth strategies for login and calendar access
module.exports = (pool) => {
  // Google OAuth Strategy for login
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      try {
        const user = await findOrCreateUser(email, pool);
        return done(null, user);
      } catch (error) {
        console.error('Google signup error:', error);
        return done(error, null);
      }
    }
  ));

  // Google OAuth Strategy for Calendar access
  passport.use('google-calendar', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/calendar/callback',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    accessType: 'offline',
    prompt: 'consent',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if (!email) return done(new Error("No email found in profile"));

      const user = await findOrCreateUser(email, pool);
      await fetchAndSaveGoogleCalendarEvents(accessToken, user.id, pool);

      const webhookUrl = 'https://1179-47-146-160-30.ngrok-free.app/webhook/google-calendar';
      await subscribeToGoogleCalendarUpdates(accessToken, webhookUrl);
            await subscribeToGoogleCalendarUpdates(accessToken, webhookUrl);

      return done(null, user);
    } catch (error) {
      console.error('Google Calendar OAuth error:', error);
      return done(error, null);
    }
  }));

  // Serialize user to session
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, userResult.rows[0]);
    } catch (error) {
      done(error, null);
    }
  });
};
const extractUserIdFromChannelId = (channelId) => {
  return channelId.split('-')[1]; // Assuming channelId format is `channel-<userId>`
};
// Helper function to subscribe to Google Calendar updates
// Helper function to subscribe to Google Calendar updates
const subscribeToGoogleCalendarUpdates = async (accessToken, webhookUrl) => {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/watch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: `channel-${Date.now()}`,
        type: 'web_hook',
        address: webhookUrl
      })
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Failed to set up Google Calendar notifications:', errorDetails);
      throw new Error(`Failed to set up Google Calendar notifications: ${errorDetails.error.message}`);
    }
  } catch (error) {
    console.error('Error setting up calendar notifications:', error.message);
    throw error; // Rethrow to handle it in the calling function
  }
};


// Webhook endpoint for handling calendar update notifications
app.post('/webhook/google-calendar', async (req, res) => {
  const channelId = req.headers['x-goog-channel-id'];
  const resourceId = req.headers['x-goog-resource-id'];

  if (!channelId || !resourceId) {
    return res.status(400).send('Missing required headers');
  }
  const getUserAccessToken = async (userId, pool) => {
    const result = await pool.query('SELECT access_token FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.access_token;
  };
  try {
    const userId = extractUserIdFromChannelId(channelId); // Implement based on your channel ID format
    const accessToken = await getUserAccessToken(userId, pool); // Retrieve access token for the user

    // Fetch updated event details
    const eventResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${resourceId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (eventResponse.ok) {
      const event = await eventResponse.json();
      await saveOrUpdateEventInDatabase(userId, event, pool); // Update your DB with the latest event data
      res.status(200).send('Event received and processed');
    } else {
      throw new Error('Failed to fetch event details');
    }
  } catch (error) {
    console.error('Error processing Google Calendar webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});
