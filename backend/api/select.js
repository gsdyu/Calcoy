
// run to drop all tables
const path = require("path");
require('dotenv').config({ path: path.join(__dirname,'../.env') });
const input = require("readline-sync");
const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl:
		process.env.NODE_ENV === 'production'
		? { rejectUnauthorized: false}
		: false,
});



pool.query(`SELECT * FROM users 
`)
  .then((result) => console.log(result)).catch((err) => console.error("Error dropping tables:", err));

console.log("Dropping...")
