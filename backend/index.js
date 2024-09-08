require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`).then(() => {
	console.log("Users table is ready")
})
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
	  .catch(err => console.error('Error creating events table:', err))
  .catch(err => console.error('Error creating users table:', err));

require('./routes/auth')(app, pool);
require('./routes/events')(app, pool);

app.get('/', async (req, res) => {
	res.send({"status":"ready"});
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
