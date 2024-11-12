//  test script to test RAG. Using the input embeddings to search for related event embeddings in database
const path = require('path')
require('dotenv').config({path: path.join(__dirname,"../.env")});
const fs = require('fs');
const {Pool} = require('pg');
const {createEmbeddings} = require('../ai/embeddings');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.NODE_ENV == 'production' ? {rejectUnauthorized: false}: false,
})


createEmbeddings("Chores")
  .then(embed => {
    pool.query(`
    SELECT user_id, title, location, start_time, end_time FROM events ORDER BY embedding <-> '${JSON.stringify(embed[0])}';`)
      .then(response => response.rows.map(event => {
      const startTime = new Date(event.start_time)
      const endTime = new Date (event.end_time)
      console.log({
        ...event,
        date: startTime.toLocaleDateString(),
        start_time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
        end_time: endTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
      })
      }))
      .catch(error => console.error(error));
  })
  .catch(error => console.error(error));
