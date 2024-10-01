require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const passport = require('passport');
const session = require('express-session');

// Initialize express app
const app = express();

// Initialize PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Load passport configuration after defining the pool
require('./config/passport')(pool);  // You only pass `pool` here, not `app`

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

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Google Auth Route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth Callback Route
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res) => {
    // Successful authentication, redirect to the frontend (calendar page).
    res.redirect('http://localhost:3000/calendar');
  }
);

// Routes for authentication and events
require('./routes/auth')(app, pool);
require('./routes/events')(app, pool);

// Create or alter users table to add 2FA columns
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    two_factor_code VARCHAR(6),  -- 2FA code column
    two_factor_expires TIMESTAMPTZ  -- 2FA expiration column
  );
`).then(() => console.log("Users table is ready"))
  .catch(err => console.error('Error creating users table:', err));

// Create events table if it doesn't exist
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
    CONSTRAINT unique_event_timeframe_per_day UNIQUE (user_id, start_time, end_time),
    CONSTRAINT end_after_or_is_start CHECK (end_time >= start_time)
  );
`).then(() => console.log("Events table is ready"))
  .catch(err => console.error('Error creating events table:', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
