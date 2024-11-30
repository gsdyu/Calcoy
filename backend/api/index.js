const path = require("path");
require('dotenv').config({ path: path.join(__dirname,"../.env") });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const jwt = require('jsonwebtoken'); 
const cookieParser = require('cookie-parser');
const handleGoogleCalendarWebhook = require('./routes/webhook');

// Initialize express app
const app = express();

app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}));
app.use(cookieParser());

// Initialize PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Load passport configuration after defining the pool
require('./config/passport')(pool);


// Set up session management
  app.use(
    expressSession({
      store: new pgSession({
        pool: pool,
        tableName: "userSessions"
      }),
      secret: process.env.COOKIE_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 30*24*60*60*1000}
    })
  );

// Routes for authentication and events
require('./routes/auth')(app, pool);
require('./routes/events')(app, pool); 
require('./routes/profile')(app, pool);
require('./routes/servers')(app, pool); 

/**
pool.query('CREATE EXTENSION IF NOT EXISTS vector;')
  .then(() => { console.log("Vector extension ready"); })
  .catch(err => { console.error('Error creating vector extension: ', err); });
 **/

// Create or alter users table to add 2FA columns
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) UNIQUE,
    privacy VARCHAR(20) DEFAULT 'public',

    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT,
    profile_image VARCHAR(255),
    profile_image_x VARCHAR(255),
    profile_image_y VARCHAR(255),
    profile_image_scale FLOAT DEFAULT 1.0,
    access_token TEXT,
    sync_token VARCHAR(255),
    refresh_token TEXT,
    dark_mode BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{"colors": {"server_default": "bg-blue-500", "other_default": "bg-green-500"}, "dark_mode": "true"}',
    two_factor_code VARCHAR(6),
    two_factor_expires TIMESTAMPTZ
  );

  CREATE TABLE IF NOT EXISTS servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    created_by INT REFERENCES users(id) ON DELETE CASCADE,
    invite_link VARCHAR(255) UNIQUE
  );

  CREATE TABLE IF NOT EXISTS "userServers" (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    server_id INT REFERENCES servers(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, server_id)
  );

  CREATE TABLE IF NOT EXISTS "watchedCalendars" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL,
    CONSTRAINT unique_name_source UNIQUE (name, source)
  );

  CREATE TABLE IF NOT EXISTS "usersWatchedCalendars"(
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    watched_calendar_id INT REFERENCES "watchedCalendars"(id) ON DELETE CASCADE,
    resource_id VARCHAR(50),
    channel_expire TIMESTAMPTZ,
    PRIMARY KEY (user_id, watched_calendar_id)
  );
  CREATE TABLE IF NOT EXISTS friend_requests (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending'
  );

`).then(() => {
  console.log("Users and Servers table is ready");
  pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      privacy VARCHAR(20) DEFAULT 'public',

      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      location VARCHAR(255),
      frequency VARCHAR(50),
      calendar VARCHAR(50),
      time_zone VARCHAR(50),
      server_id INT REFERENCES servers(id) ON DELETE CASCADE,
      ai BOOLEAN,
      completed BOOLEAN,
      include_in_personal BOOLEAN DEFAULT FALSE,
      imported_from VARCHAR(50),
      imported_username VARCHAR(50),
      CONSTRAINT end_after_or_is_start CHECK (end_time >= start_time)
    );
  `
    );
  })
  .then(() => {
    console.log('Events table is ready');
    // Create conversations table
    return pool.query(
      `
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `
    );
  })
  .then(() => {
    console.log('Conversations table is ready');
    // Create messages table
    return pool.query(
      `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
      sender VARCHAR(50) NOT NULL, -- 'user' or 'model'
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `
    );
  })
  .then(() => {
    console.log('Messages table is ready');
  })
  .catch((err) => {
    console.error('Error creating tables: ', err);
  });
  pool.query(`
CREATE TABLE IF NOT EXISTS "userSessions" (
  sid VARCHAR NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL,
  token VARCHAR(200),
  CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON "userSessions" (expire);`).then(() => console.log("Sessions table is ready")
    ).catch(err => console.error("Error creating sessions table:", err));

// Additional routes

app.post('/webhook/google-calendar', handleGoogleCalendarWebhook(pool));

app.get('/', async (req, res) => {
  res.send({ "status": "ready" });
});


// Start the server
console.log("Server is running")

module.exports = app;
