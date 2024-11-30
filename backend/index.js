const path = require("path");
require('dotenv').config({ path: path.join(__dirname, ".env") });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const handleGoogleCalendarWebhook = require('./routes/webhook');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cookieParser());

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Load passport configuration after defining the pool
require('./config/passport')(pool);

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Set up session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'some_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Routes for authentication and events
require('./routes/auth')(app, pool);
require('./routes/events')(app, pool, io); // Pass `io` to the routes for real-time events
require('./routes/profile')(app, pool);
require('./routes/servers')(app, pool, io); // Pass `io` to the servers route

pool.query('CREATE EXTENSION IF NOT EXISTS vector;')
  .then(() => { console.log("Vector extension ready"); })
  .catch(err => { console.error('Error creating vector extension: ', err); });

// Create or alter users table to add 2FA columns
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) UNIQUE,
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
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      location VARCHAR(255),
      frequency VARCHAR(50),
      calendar VARCHAR(50),
      time_zone VARCHAR(50),
      server_id INT REFERENCES servers(id) ON DELETE CASCADE,
      ai BOOLEAN,
      embedding vector(128),
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

// Additional routes
require('./routes/auth')(app, pool);
require('./routes/events')(app, pool, io); // Pass `io` to events for WebSocket broadcasting
require('./routes/ai')(app, pool);

app.post('/webhook/google-calendar', handleGoogleCalendarWebhook(pool, io));

app.get('/', async (req, res) => {
  res.send({ "status": "ready" });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected to WebSocket');

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected from WebSocket');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`\nServer running on port ${PORT}`));
