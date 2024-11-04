const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fetch = require('node-fetch');
const { createEmbeddings } = require('../ai/embeddings');


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
          calendar: 'Google',
          time_zone: event.start.timezone || 'UTC'
        };
      }
      else if (!event.start.datetime && !event.end.datetime) {
        // events with no end date are considered all-day
        // this logic adds one day extra to the start date
        event_end_date = new Date (new Date(`${event.start.date}T00:00:00`).getTime()+24*60*60*1000)      
        console.log(event_end_date)
        eventData = {
          user_id: userId,
          title: event.summary || 'No Title',
          description: event.description || '',
          start_time: new Date(`${event.start.date}T00:00:00`),
          end_time: event_end_date,
          location: event.location || '',
          calendar: 'Google',
          time_zone: event.start.timeZone || 'UTC'
        };
        console.log('before: ',eventData.start_time)
        console.log('after: ',eventData.end_time)
      }
      return eventData;
    });

  // stores the callback events into our calendar
    // Insert events into the database
    const insertPromises = events.map(event =>
      pool.query(
        `INSERT INTO events (user_id, title, description, start_time, end_time, location, calendar, time_zone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
                       [row[0].user_id, row[0].title, row[0].location, row[0].start_time.toISOString(), row[0].end_time.toISOString(), JSON.stringify(embed_result[0])]);  
         }) 
       } catch (error) {
           if (error.status===402) {
             console.log("Error: Out of tokens")
             return
           }
         }
    })
    );

    await Promise.all(insertPromises);

  } catch (error) {

    console.error(`error: ${error}`)
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
