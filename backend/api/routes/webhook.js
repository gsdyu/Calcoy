const fetch = require('node-fetch');

const addGoogleCalendarEvents = async (calendarData, userId, pool, io) => {
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
      } else if (!event.start.datetime && !event.end.datetime) {
        event_end_date = new Date (new Date (`${event.start.date}T00:00:00`).getTime()+24*60*60*1000)
        eventData = {
          user_id: userId,
          title: event.summary || 'No Title',
          description: event.description || '',
          start_time: new Date(`${event.start.date}T00:00:00`),
          end_time: event_end_date,
          location: event.location || '',
          calendar: 'Google',
          time_zone: event.start.timezone || 'UTC'
        }
      }
      return eventData;
    }); 
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
      const rows = result.rows;
      io.emit('eventCreated', rows)
        if (!rows[0]) {
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
              [rows[0].user_id, rows[0].title, rows[0].location, rows[0].start_time.toISOString(), rows[0].end_time.toISOString(), JSON.stringify(embed_result[0])]
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

const fetchAndSaveGoogleCalendarEvents = async (refreshToken, calendarName, userId, pool, io) => {
  // Retrieve the last sync token for this user, if any
  const result = await pool.query('SELECT access_token, sync_token FROM users WHERE id = $1', [userId]);
  let syncToken = result.rows[0]?.sync_token;
  let accessToken = result.rows[0]?.access_token;

  let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarName}/events?singleEvents=true`;
  if (syncToken) {
      console.log("\nPerforming incremental sync.");
      url += `&syncToken=${syncToken}`;
  } else {
      console.log("\nPerforming full sync.");
  }

  // Fetch events with sync or full sync token
   response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
      if ((response.status === 403 || response.status === 401)) {
        try {
          accessToken = await refreshAccessToken(refreshToken)
          response = await fetch(url, {
              method: 'GET',
              headers: { Authorization: `Bearer ${accessToken}` }
          });
        } catch (error){
          console.error("Unauthorized for Google API and inefficient/lacking refresh token")
          throw new Error('Unauthorized for Google API and inefficient/lacking refresh token.') 
        }
      }
      if (response.status === 410) {
        
        // Token invalidated, trigger a full sync
          console.warn('Sync token expired, initiating a full sync.');
          await pool.query('UPDATE users SET sync_token = NULL WHERE id = $1', [userId]);
          return await fetchAndSaveGoogleCalendarEvents(refreshToken, calendarName, userId, pool, io);
      }
      throw new Error('Failed to fetch calendar events');
  }

  let calendarData = await response.json();
  addGoogleCalendarEvents(calendarData, userId, pool, io)
  let newPageToken = calendarData.nextPageToken;
  let page = 0;
  let newEvents = calendarData.items.length;

  while (newPageToken) {
    console.log("page:",page)
    url = `https://www.googleapis.com/calendar/v3/calendars/${calendarName}/events?singleevents=true`;
    if (syncToken) {
        url += `&syncToken=${syncToken}`;
    }
    url += `&pageToken=${newPageToken}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}`}})
    calendarData = await response.json()
    // Save events to the database
    addGoogleCalendarEvents(calendarData, userId, pool, io);

    newPageToken = calendarData.nextPageToken;
    page+=1
    newEvents+=calendarData.items.length;
  }
  console.log(newEvents, "new events from Google")

  // Update sync token for the next incremental sync
  const newSyncToken = calendarData.nextSyncToken;
  if (newSyncToken) {
      await pool.query('UPDATE users SET sync_token = $1 WHERE id = $2', [newSyncToken, userId]);
  }
  return 1;
};


// Helper function to refresh the access token
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new Error('No refresh token available for user');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const errorDetails = await response.json();
    console.error('Failed to refresh access token:', errorDetails);
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  const newAccessToken = data.access_token;

  await pool.query('UPDATE users SET access_token = $1 WHERE id = $2', [newAccessToken, userId]);
  console.log('Access token refreshed and saved for user:', userId);

  return newAccessToken;
};

// Main webhook handler function
const handleGoogleCalendarWebhook = (pool, io) => async (req, res) => {
  res.status(200).send('Event recieved')
  const channelId = req.headers['x-goog-channel-id'];
  const resourceId = req.headers['x-goog-resource-id'];

  if (!channelId || !resourceId) {
    console.error('Missing required headers in webhook request');
  }
  const now = Date.now();

  const watchedCalendars = await pool.query(`SELECT "watchedCalendars".name, "watchedCalendars".source, users.access_token, users.id
    FROM "watchedCalendars"
    INNER JOIN "usersWatchedCalendars" ON "watchedCalendars".id="usersWatchedCalendars".watched_calendar_id
    INNER JOIN users ON users.id="usersWatchedCalendars".user_id
    WHERE "usersWatchedCalendars".resource_id=$1`,[resourceId]).then(results => results.rows).catch(error => console.error("error occured:", error));
  watchedCalendars.map(async row => {
    if (row.source != "google") {
      console.log("skipping -> notification not from google");
      return
    }
    const userTokens = await pool.query(`SELECT refresh_token FROM users WHERE id=$1`, [row.id]).then(results => results.rows[0]) 
    try {
      const success = await fetchAndSaveGoogleCalendarEvents(userTokens.refresh_token, row.name, row.id, pool, io)

      if (success) { 
        console.log("Event receieved and processed")
      }
      else {
        throw new Error('Event failed to process') 
      }
    } catch (error){
      console.error('Error occurred during saving:', error)
    }
  })
}    

module.exports = handleGoogleCalendarWebhook;
