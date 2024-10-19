const path = require('path')
require('dotenv').config({path: path.join(__dirname,"../.env")});
const fs = require('fs');
const {Pool} = require('pg');
const {createEmbeddings} = require('../ai/embeddings');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.NODE_ENV == 'production' ? {rejectUnauthorized: false}: false,
})

const file = JSON.parse(fs.readFileSync(path.join(__dirname,'boiler_event.json'),'utf8'));
const events = file.events;
let events_string = events.map(event=>JSON.stringify(event));

createEmbeddings(events_string)
	.then(embed => {
    console.log(embed, embed.length);
    for (let i = 0; i < 5; i++) {
      pool.query(
        `UPDATE events 
         SET embedding = '${JSON.stringify(embed[i])}'
         WHERE user_id='${events[i].user_id}' AND location='${events[i].location}' AND start_time='${events[i].start_time}' AND end_time='${events[i].end_time}'`
      )
        .then((result)=>console.log("added embeddings"))
        .catch((error)=>console.error(error));
    }
         
  })
	.catch(error => console.error(error));
