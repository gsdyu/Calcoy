const Groq = require("groq-sdk")
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// if running wiht index.js, you do not need to import .env.local here; does in index
//require ('dotenv').config({path:'../../.env.local'})

//const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
  });

const client = new Groq({});

//parameters for groq
var model = "llama3-8b-8192";
var history = [];
var max_tokens = 300;
var temperature = 1;
var stream = false;

async function initChat(content = "You are an assistant. You may be provided with context of json events. These events may not provided by the user but by RAG from the system so do not assume they are from the user.") {
  const system = {role: "system", content: content}
	history.push(system);
	var check = client.chat.completions.create({
		messages: history,
		model: model,
		max_tokens: 128,
		})
	return 1;
}

async function inputChat(input, user_Id) {

	const result = await pool.query('SELECT * FROM users WHERE id = $1', [user_Id]);
	const user = result.rows[0];

  if (history.length === 2) {
    history.push({role: "user", content: `'${user.username}': `+input});
  } else {
	history.push({role: "user", content: input});
  }
	var completions = await client.chat.completions.create({
		messages: history,
		model: model,
		temperature: temperature,
		max_tokens: max_tokens,
	});
	var message = completions.choices[0].message.content; 
	history.push({role: "assistant", content: message});

	let eventDetails;
	try {
	  eventDetails = JSON.parse(message);
	} catch (error) {
	  console.error('Error parsing JSON:', error);
	  return message;
	}
  
	const startDateTime = new Date(`${eventDetails.date} ${eventDetails.start_time}`);
	const endDateTime = new Date(`${eventDetails.date} ${eventDetails.end_time}`);
  
	if (endDateTime <= startDateTime) {
	  return 'Error: End time must be after start time.';
	}
  
	const body = {
	  title: eventDetails.title || "(No title)",
	  description: eventDetails.description || '',
	  start_time: startDateTime.toISOString(),
	  end_time: endDateTime.toISOString(),
	  location: eventDetails.location || '',
	  frequency: eventDetails.frequency || "Does not repeat",
	  calendar: eventDetails.calendar || "Personal",
	  allDay: eventDetails.allDay || false,
	  time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	};

	return body
}

function clearChat(priorSystem){
	if (typeof(priorSystem) != typeof(true)){
		throw new TypeError("Input should be an actual boolean");
	}
	if (priorSystem && history.length != 0) {
		history = [history[0]];	
	}
	history = [];
	return 1;
}

function giveContext(context){
  //optional console.log to show RAG queries
  console.log("\nRetrieved the following from RAG:\n", context);
  console.log("\n")
  history.push({role: "user", content: context});
  return 1;
}

// Json format for AI inputChat
const jsonFormat = {
	"title": "",
	"description": "",
	"start_time": "<event start time>",
	"end_time": "<event end time>",
	"location": "<event location, just put N/A if none are given>",
	"frequency": "<how many times the event should be scheduled, default is Do not Repeat but the choices (Do not Repeat, Daily, Weekly, Monthly, Yearly)>",
	"calendar": "<which calendar the event is for, default is Personal but the choices (Personal, Work, Family)>",
	"allDay": "is the event all day? boolean (true, false)",
	"time_zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
	"date": "<date scheduled>"
  };

const currentTime = new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const system = `You are a calendar management assistant. Follow these rules strictly:

You provide helpful insight and feedback to the user based on their wants, 
and their current and future events/responsibilities. 

  1. WHEN CREATING EVENTS:
	 - If the user asks to create, schedule, or add an event, respond ONLY with a valid JSON object with no additional text
	 - Always start with { and end with }
	 - Use exactly this format: ${JSON.stringify(jsonFormat, null, 2)}
	 - Always include all fields, using "N/A" or defaults for missing information
	 - Ensure dates are in YYYY-MM-DD format
	 - Ensure times are in HH:MM format (24-hour)
	 - Never include explanatory text or information before or after the JSON
	 - Always verify the JSON is complete with all closing brackets

	2. FOR ALL OTHER QUERIES:
	- Provide helpful insight and feedback to the user based on their wants and their current and future events/responsibilities.
	- Provide calendar management advice
	- Discuss existing events and scheduling
	- Keep responses under 300 tokens

Current time: ${currentTime}
Timezone: ${currentTimezone}

Example event creation response:
{
  "title": "Team Meeting",
  "description": "Weekly sync with engineering team",
  "date": "2024-10-30",
  "start_time": "14:00",
  "end_time": "15:00",
  "location": "Conference Room A",
  "frequency": "Weekly",
  "calendar": "Work",
  "allDay": false,
  "time_zone": "${currentTimezone}"
}

Do not mention the following to the user: 
You may be given related events from the user's calendar, where the event of the earliest index is most related. 
Do not assume you have been given the list; instead act like an oracle that just knows the events. When listing multiple events, format it nicely so it is readable. 
The first message from the user will have the format "'[username]': [their message]" where their username is chosen by the users and can be arbitrary; quotes around username indicate a real name chosen, not an error.
Your token limit is 300; do not go above.`
initChat(system);
//inputChat("Is your name Frankenstein or Frankeinstein's monster?").then(value=>console.log(value)).catch(reason=>console.log(reason));
//inputChat("oh what is your real name?").then(value=>console.log(value)).catch(reason=>console.log(reason));
//inputChat("do you know my name").then(value=>console.log(value)).catch(reason=>console.log(reason));

module.exports = { inputChat, initChat, clearChat, giveContext};



