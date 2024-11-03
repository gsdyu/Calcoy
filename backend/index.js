const path = require("path");
require('dotenv').config({ path: path.join(__dirname,".env") });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const jwt = require('jsonwebtoken'); 
const cookieParser = require('cookie-parser');

// Initialize express app
const app = express();

app.use(cookieParser())

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
require('./routes/events')(app, pool);
require('./routes/profile')(app, pool);
require('./routes/servers')(app, pool);

pool.query('CREATE EXTENSION IF NOT EXISTS vector;')
	.then(() => {console.log("Vector extension ready")})
	.catch(err => {console.error('Error creating vector extension: ', err)});

// Create or alter users table to add 2FA columns
pool.query(`  
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT,  -- Set password to allow NULL for OAuth users
    profile_image VARCHAR(255),
    dark_mode BOOLEAN DEFAULT false, -- dark mode preference
    preferences JSONB DEFAULT '{}',  -- Store event preferences (visibility and colors)
    two_factor_code VARCHAR(6),
    two_factor_expires TIMESTAMPTZ
  );
    CREATE TABLE IF NOT EXISTS servers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      image_url VARCHAR(255),
      created_by INT REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_servers (
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      server_id INT REFERENCES servers(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, server_id)
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
      server_id INT REFERENCES servers(id) ON DELETE CASCADE,

      embedding vector(128),
      completed BOOLEAN,
      CONSTRAINT end_after_or_is_start CHECK (end_time >= start_time)
    );
      ALTER TABLE events ADD COLUMN IF NOT EXISTS server_id INT REFERENCES servers(id) ON DELETE CASCADE;
      ALTER TABLE events DROP CONSTRAINT IF EXISTS unique_event_timeframe_per_day;

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
