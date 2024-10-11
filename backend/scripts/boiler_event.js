const path = require('path');
require('dotenv').config({ path: path.join(__dirname,"../.env")});
const fs = require('fs');
const {Pool} = require('pg');

console.log(path.join(__dirname,"../.env"))
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});


const file = JSON.parse(fs.readFileSync(path.join(__dirname,'boiler.json'),'utf8'));
const events = file.events;
try {
	for (let i = 0; i < file.events.length-1; i++) {
		/**query is an postgre upsert. if an event that already exist is added, 
		 * postgre will ignore
		 * the constraint used here for ON CONFLICT is arbitrary
		*/
		let result = pool.query(
			`INSERT INTO events (user_id, title, description, start_time, end_time, location, frequency, calendar, time_zone) 
			VALUES ('${events[i].user_id}', '${events[i].title}', '${events[i].description}', '${events[i].start_time}', '${events[i].end_time}', '${events[i].location}', '${events[i].frequency}', '${events[i].calendar}', '${events[i].time_zone}') 
			ON CONFLICT ON CONSTRAINT unique_event_timeframe_per_day DO NOTHING
	  	RETURNING *`
		);
	}
} catch (error) {
	console.error('error inserting boiler', error);
}



/**INSERT INTO events (user_id, title, description,
					start_time, end_time, location,
					frequency, calendar, time_zone)
			VALUES (1, 'Dinner with Kate', NULL, 
					'2024-10-10 00:00:00-07', 
					'2024-10-10 21:53:00-07', 'Mcdonalds',
					'Does not repeat', 'Personal', 
					'America/Los_Angeles')
 **/
	
