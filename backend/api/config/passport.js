const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fetch = require('node-fetch');
const express = require('express');
const app = express(); // Assuming this is your main file
const path = require("path");
require('dotenv').config({ path: path.join(__dirname,'../.env') });
const { createEmbeddings } = require('../ai/embeddings');

// Helper function to find or create a user by email
const findOrCreateUser = async (email, googleUsername, pool) => {
  let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  let user = userResult.rows[0];

  if (!user) {
    // If the user doesn't exist, create a new one with Google username
    const newUserResult = await pool.query(
      'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
      [googleUsername, email]
    );
    user = newUserResult.rows[0];
  } else if (!user.username) {
    // If the user exists but doesn't have a username, update it
    await pool.query('UPDATE users SET username = $1 WHERE email = $2', [googleUsername, email]);
    user.username = googleUsername;
  }

  return user;
};
const addGoogleCalendarEvents = async (calendarData, userId, pool, email) => {
  try {
    const events = calendarData.items.filter(event => {
      if (event.status === 'cancelled') return false;
      return true;
    }).map(event => {
      let eventData = {user_id: 'userid'};
      if (!event.start.date && !event.end.date) {
        eventData = {
          user_id: userId,
          title: event.summary || 'No Title',
          description: event.description || '',
          start_time: new Date(event.start.dateTime),
          end_time: new Date(event.end.dateTime),
          location: event.location || '',
          calendar: 'Personal',
          time_zone: event.start.timezone || 'UTC',
          imported_from: "google",
          imported_username: email
        };
      } else if (!event.start.datetime && !event.end.datetime) {
        event_end_date = new Date (new Date (`${event.start.date}T00:00:00`).getTime()+24*60*60*1000)
        eventData = {
          user_id: userId,
          title: event.summary || 'No Title',
          description: event.description || '',
          start_time: new Date(`${event.start.date}T00:00:00`),
          end_time: event_end_date,
          location: event.location || '',
          calendar: 'Personal',
          time_zone: event.start.timezone || 'UTC',
          imported_from: "google",
          imported_username: email
        }
      }
      return eventData;
    }); 
    const insertPromises = events.map(event =>
      pool.query(
        `INSERT INTO events (user_id, title, description, start_time, end_time, location, calendar, time_zone, imported_from, imported_username)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING
         RETURNING *;`,
        [
          event.user_id, 
          event.title,
          event.description,
          event.start_time,
          event.end_time,
          event.location,
          event.calendar,
          event.time_zone,
          event.imported_from,
          event.imported_username
        ]
    ).then(async result => {
      // checks for embedding on all events. can convert to function
      // using this rather than create events gain from callback as using callback as it may recreate embedding even if the event already exist
      // callback events will always be given even if our calendar already has it stored
      const row = result.rows;
        if (!row[0]) {
          console.log('Import: Event already added')
          return};
        try {
          const embed = await createEmbeddings(JSON.stringify(row)
          ).then(embed_result => {
            if (embed_result === null || embed_result === undefined) { 
              console.error(`Error: No embeddings were created. Possibly out of tokens.`);
              return
            }
            pool.query(`UPDATE events
              SET embedding = $6
              WHERE user_id=$1 AND title=$2 AND location=$3 AND start_time=$4 AND end_time=$5;`, 
              [row[0].user_id, row[0].title, row[0].location, row[0].start_time.toISOString(), row[0].end_time.toISOString(), JSON.stringify(embed_result[0])]
            );  
          }
         ) 
       } catch (error) {
         if (error.status===402) {
           console.log("Error: Out of tokens")
           return
         }
       }
    })
    );
    await Promise.all(insertPromises)
  } catch (error) {
    console.error(`error adding events:`, error)
  }
}
// Helper function to fetch and save calendar events to PostgreSQL
// Helper function to fetch and save Google Calendar events with incremental sync
const fetchAndSaveGoogleCalendarEvents = async (accessToken, userId, pool, email) => {
  // Retrieve the last sync token for this user, if any
  const result = await pool.query('SELECT sync_token FROM users WHERE id = $1', [userId]);
  let syncToken = result.rows[0]?.sync_token;

  let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true';
  if (syncToken) {
      console.log("\nPerforming incremental sync.");
      url += `&syncToken=${syncToken}`;
  } else {
      console.log("\nPerforming full sync.");
  }

  // Fetch events with sync or full sync token
  const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
      if (response.status === 410) {
          // Token invalidated, trigger a full sync
          console.warn('Sync token expired, initiating a full sync.');
          await pool.query('UPDATE users SET sync_token = NULL WHERE id = $1', [userId]);
          return await fetchAndSaveGoogleCalendarEvents(accessToken, userId, pool, email);
      }
      throw new Error('Failed to fetch calendar events');
  }

  let calendarData = await response.json();
  addGoogleCalendarEvents(calendarData, userId, pool, email)
  let newPageToken = calendarData.nextPageToken;
  let page = 0;
  let newEvents = calendarData.items.length;

  while (newPageToken) {
    console.log("page:",page)
    url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleevents=true`;
    if (syncToken) {
        url += `&syncToken=${syncToken}`;
    }
    url += `&pageToken=${newPageToken}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}`}})
    calendarData = await response.json()
    // Save events to the database
    addGoogleCalendarEvents(calendarData, userId, pool, email);

    newPageToken = calendarData.nextPageToken;
    page+=1
    newEvents+=calendarData.items.length;
  }
  console.log(newEvents, "new events from Google")

  // Update sync token for the next incremental sync
  const newSyncToken = calendarData.nextSyncToken;
  newPageToken = calendarData.nextPageToken;
  if (newSyncToken) {
      await pool.query('UPDATE users SET sync_token = $1 WHERE id = $2', [newSyncToken, userId]);
  }
};


// Set up the Google OAuth strategies for login and calendar access
module.exports = (pool) => {
  // Google OAuth Strategy for login
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://backend-three-puce-56.vercel.app/auth/google/callback',
        accessType: 'offline', // Request offline access
        prompt: 'consent',     // Force re-consent to receive the refresh token
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        const googleUsername = profile.displayName; // Retrieve the Google username
  
        try {
          // Find or create the user
          const user = await findOrCreateUser(email, googleUsername, pool); // Include username
          return done(null, user);
        } catch (error) {
          console.error('Google signup error:', error);
          return done(error, null);
        }
      }
    )
  );


  // Google OAuth Strategy for Calendar access
 passport.use('google-calendar', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google/calendar/callback`,
  
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

    // Fetch or create the user
    const user = await findOrCreateUser(email, pool);
    if (refreshToken) {
      await pool.query(
        'UPDATE users SET access_token = $1, refresh_token = $2 WHERE id = $3',
        [accessToken, refreshToken, user.id]
      );
    } else {
      await pool.query(
        'UPDATE users SET access_token = $1 WHERE id = $2',
        [accessToken, user.id]
      );
    }
    // Save calendar events to the database
    await fetchAndSaveGoogleCalendarEvents(accessToken, user.id, pool, email);

    // Webhook URL for Google Calendar notifications
    const webhookUrl = `${process.env.WEBHOOK_DOMAIN_URL}/webhook/google-calendar`;
     
    // Set up Google Calendar notification only once
    await subscribeToGoogleCalendarUpdates(accessToken, webhookUrl, user.id, pool, email);

    // Add accessToken to the user object for further use
    user.accessToken = accessToken;
    
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
// Helper function to subscribe to Google Calendar updates
// For Primary calendars only
const subscribeToGoogleCalendarUpdates = async (accessToken, webhookUrl, userId, pool, email) => {
  try {
    const userName = await pool.query(`SELECT username FROM users WHERE id=$1`, [userId]).then(results => results?.rows[0]?.username)
    const result = await pool.query(`SELECT "usersWatchedCalendars".channel_expire FROM "usersWatchedCalendars" 
      INNER JOIN "watchedCalendars" ON "usersWatchedCalendars".watched_calendar_id="watchedCalendars".id
      WHERE "watchedCalendars".name=$1 AND "watchedCalendars".source='google' AND "usersWatchedCalendars".user_id=$2;
    `, [email, userId]).then(results => results?.rows[0])
    const currentChannel = result?.channel_expire
    if (Date.now() < new Date(currentChannel).getTime()){
      console.log(`\nChannel for google primary already set up for user ${userName}`)
      console.log(`The channel will expire on: ${new Date(currentChannel)}`)
      return
    }
    const expiration = Date.now() + 86400000
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/watch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: `channel-${Date.now()}`,
        type: 'web_hook',
        address: webhookUrl,
        expiration: expiration 
      })
    });
    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Failed to set up Google Calendar notifications:', errorDetails);
      throw new Error(`Failed to set up Google Calendar notifications: ${errorDetails.error.message}`);
    }

    const responseJson = await response.json()
    let resourceId = responseJson.resourceId
    await pool.query(`INSERT INTO "watchedCalendars" (name, source) VALUES ($1, 'google') 
      ON CONFLICT ON CONSTRAINT unique_name_source DO NOTHING`, [email])
    const watchedCalendarId = await pool.query(`SELECT id FROM "watchedCalendars" WHERE name = $1 AND source = 'google';`,[email]).then(async result => {return result.rows[0]?.id}) 
    await pool.query(`INSERT INTO "usersWatchedCalendars" (user_id, watched_calendar_id, resource_id, channel_expire) VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '1 day')
      ON CONFLICT ON CONSTRAINT "usersWatchedCalendars_pkey" DO UPDATE SET resource_id=EXCLUDED.resource_id, channel_expire=CURRENT_TIMESTAMP+INTERVAL '1 day'`, [userId, watchedCalendarId, resourceId])

    console.log(`\nChannel for watched calendar set up for user ${userName}`)
    console.log(`The channel will expire on: ${new Date(expiration)}`)

  } catch (error) {
    console.error('Error setting up calendar notifications:', error.message);
    throw error; // Rethrow to handle it in the calling function
  }
};
}
