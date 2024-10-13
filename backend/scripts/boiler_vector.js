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
const events_string = events.map(event=>JSON.stringify(event));

createEmbeddings(events_string)
	.then(embed => console.log(embed, embed.length))
	.catch(error => console.error(error));
