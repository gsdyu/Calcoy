const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fetch = require('node-fetch');

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

module.exports = (pool) => {
  // Google OAuth Strategy for login
  passport.use(
    new GoogleStrategy(
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
    )
  );

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
      console.log("Access Token:", accessToken);
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if (!email) return done(new Error("No email found in profile"));

      const user = await findOrCreateUser(email, pool);
      await fetchAndSaveGoogleCalendarEvents(accessToken, user.id, pool);

      return done(null, user);
    } catch (error) {
      console.error('Google Calendar OAuth error:', error);
      return done(error, null);
    }
  }));

  // Serialize user to session
  passport.serializeUser((user, done) => done(null, user.id));
  
  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, userResult.rows[0]);
    } catch (error) {
      done(error, null);
    }
  });
};
