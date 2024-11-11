// run to drop all tables
const path = require("path");
require('dotenv').config({ path: path.join(__dirname,'../.env') });
const input = require("readline-sync");
const { Pool } = require('pg');

const userInput = input.question("\nProceeding to drop all tables. Enter 1 to confirm the drop, otherwise to cancel.\n> ");

if(userInput != "1"){
	throw "Cancelled"
}

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl:
		process.env.NODE_ENV === 'production'
		? { rejectUnauthorized: false}
		: false,
});



pool.query(`
  DROP TABLE conversations CASCADE;
  DROP TABLE messages CASCADE;
  DROP TABLE user_servers CASCADE;
  DROP TABLE servers CASCADE;
	DROP TABLE events CASCADE;
	DROP TABLE users CASCADE;
`)
	.catch((err) => console.error("Error dropping tables:", err));

console.log("Dropping...")
