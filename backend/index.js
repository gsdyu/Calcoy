require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const passport = require('passport');
const session = require('express-session');
const jwt = require('jsonwebtoken'); 

// Initialize express app
const app = express();

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

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Google Auth Route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth Callback Route
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }),
  async (req, res) => {
    const email = req.user.email;
    try {
      let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user = userResult.rows[0];

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Store the token in the session or cookies
      req.session.token = token;
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      // Redirect to the username page if the user has no username set
      if (!user.username) {
        req.session.tempUser = { email }; // Save email in session for username setup
        return res.redirect('http://localhost:3000/username');
      }

      // Otherwise, redirect to the calendar page
      res.redirect('http://localhost:3000/calendar');
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).send('Internal server error');
    }
  }
);

// Routes for authentication and events
require('./routes/auth')(app, pool);
require('./routes/events')(app, pool);
require('./routes/profile')(app, pool);

// Create or alter users table to add 2FA columns
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT,  -- Set password to allow NULL for OAuth users
    two_factor_code VARCHAR(6),
    profile_image VARCHAR(255),
    dark_mode BOOLEAN DEFAULT false, -- dark mode preference
    two_factor_expires TIMESTAMPTZ
  );
`).then(() => {
  console.log("Users table is ready");
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
      CONSTRAINT unique_event_timeframe_per_day UNIQUE (user_id, start_time, end_time),
      CONSTRAINT end_after_or_is_start CHECK (end_time >= start_time)
    );
  `).then(() => console.log("Events table is ready"))
    .catch(err => console.error('Error creating events table:', err));
}).catch(err => console.error('Error creating users table:', err));

// Additional routes
require('./routes/auth')(app, pool);
require('./routes/events')(app, pool);
require('./routes/ai')(app, pool);

app.get('/', async (req, res) => {
  res.send({ "status": "ready" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
