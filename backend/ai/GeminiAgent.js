const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require('dotenv').config({ path: path.join(__dirname,"../.env") });
const { createEmbeddings } = require('../ai/embeddings');

// if running wiht index.js, you do not need to import .env.local here; does in index
//require ('dotenv').config({path:'../../.env.local'})



class Gemini_Agent {
  #genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  #client
  //parameters for groq
  #model
  #history;
  #maxOutputTokens;
  #temperature;

  constructor(content="You are an assistant. You may be provided with context of json events. These events may not provided by the user but by RAG from the system so do not assume they are from the user.", model="gemini-1.5-flash", history=[], maxOutputTokens=100, temperature=1) {
    const system = {role: "user", parts: [{text: content}]}
    if (history.length > 0) this.#history = history;
    else this.#history = [system]
    this.#model = model;
    this.#maxOutputTokens = 100;
    this.#temperature = 1;

    this.#client = this.#genAI.getGenerativeModel({ 
      model: this.#model,
      generationConfig: {
        candidateCount: 1,
        maxOutputTokens: this.#maxOutputTokens,
        temperature: this.#temperature,
      },
    });
    return 1;
  }

  async inputChat(input, context, maxOutputTokens, temperature ) {
    let real_input = input
    if (context) real_input += `\n\nEvents - ${context}`
    this.#history.push({role: "user", parts: [{text: real_input}]});
    var result = await this.#client.generateContent({
      contents: this.#history,
      generationConfig: {
        maxOutputTokens: this.#maxOutputTokens,
        temperature: this.#temperature,
      }
    });
    var message = result.response.text(); 
    this.#history.push({role: "model", content: message});
    return message;
  }

}

//const system = `You are an assistant for a calendar app. You provide helpful insight and feedback to the user based on their wants, and their current and future events/responsibilities. Being realistic is important, do whats best for the user, but also whats possible. The current date is ${new Date().toISOString()} Do not mention the following to the user: You may be given related events from the user's calendar, where the event of the earliest index is most related. Do not assume you have been given the list; instead act like an oracle that just knows the events. When listing multiple events, format it nicely so it is readable. Your token limit is 300; do not go above.`
//const bot = new Chat(system);
//bot.inputChat("Is your name Frankenstein or Frankeinstein's monster?").then(value=>console.log(value)).catch(reason=>console.log(reason));
//inputChat("oh what is your real name?").then(value=>console.log(value)).catch(reason=>console.log(reason));
//inputChat("do you know my name").then(value=>console.log(value)).catch(reason=>console.log(reason));

const jsonFormat = {
  "type": "CreateEvent",
	"title": "",
	"description": "",
	"start_time": "<event start time>",
	"end_time": "<event end time>",
	"location": "<event location, just put N/A if none are given>",
	"frequency": "<event frequency, default is Do not Repeat >",
	"calendar": "<which calendar the event is for, default is Personal unless given>",
	"time_zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
	"date": "<date scheduled like '01/01/24', or 'unknown', if not sure>"
  };

const currentTime = new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const rag = new Gemini_Agent(content = `You provide helpful insight and feedback to the user based on their wants and current and future events/responsibilities. Being realistic is important; do what's best for the user while considering what's possible. The current date is ${currentTime} and the timezone is ${currentTimezone}.  Do not mention the following to the user: You may be given context in events from the user's calendar, where the event of the earliest index is most relevant. Act like an oracle that knows the events without assuming you have the list. Information about the users and their events is only known from this conversation; do not assume.

Rather than give a response, you have the option to output a json file that can be preprocessed by the server to satisfy a general function. The two general function available are Context, to get more information about a user's query through a database, and CreateEvent, which creates an event for the user.
___
Context:

When you are not given any context events, you can respond with 
to indicate you need additional information from a database that stores the user's and their friends' daily events; specifically when you need more information that can be used to infer the user's situation or feelings "calendar events", "user information", or "friend information". 
You can specify context further by adding additional keywords like so
{type: context, time: [*keyword*]}
where the [*keyword*] is a placeholder to describing the time range.
The keywords available-
time: specify the most relevant timeframe for this query.
[*time* context]
*time* is general and is replaced by three timeframe, 1. anytime, 2. near, 3. past, 4. future. near consider a close distance rather than an event before or after
{"type": "context", "time": "anytime"}
{"type": "context", "time": "near"}
{"type": "context", "time": "future"}
{"type": "context", "time": "past"}
Decide on using one of these

When listing multiple events, format it nicely for readability. Your token limit is 300; do not exceed it. Information about the users and their events is only known from this conversation; do not assume.



Follow this if statement to decide on your output.

if (need context) : "*keyword* context"
else: "[response]"
---
Example without needing context
---
User Input:
Events-{"title":"Mcdonald Lunch", "start_date":"8 am Monday", "end_date":"9 am Monday"}

When do I have dinner?

Response:
It looks like you have Lunch at Mcdonalds at 8 am to 9 am on Monday. Its a little early to call it lunch though!
---
Examples needing context
---
User Input:
Events-{"title":"Mcdonald Lunch", "start_date":"8 am Monday", "end_date":"9 am Monday"}

What do I study for tomorrows test

Response:
{"type": "context", "time": "near'}
---
User Input:
Events-{}

How many times have I hung out with my friends?

Response:
{"type": "context", "time": "anytime"}
---
User Input:
Events-{}

I have a problem

Response:
{"type": "context", "time": "near"}
---
User Input:
Events-{}

should I go to costco

Response:
{type: context, time: 'near'}
---
Depending on the current conversation history, the same question can differ in requiring context
---
Example of conversation history requiring more context with same question
---
[{role: user, content: "Do you have any insight for me?"}]
---
Example of conversation history not requiring more context with same question
---
[{role: user, content: "I need help studying for my test"}, {role: model, content: "context"}, {role: user, content: "Events - {Title: 'Trig test', Start_time: 'Friday 6 am', Description: 'Pythagorean, word problems'}}, {role: model, content: '*insert tip here*'}, {role: model, content:'Do you have any insight for me'}"}]
___

CreateEvent:

// this part is just placeholder for CreateEvent prompt. feel free to replace

 When asked to create new events, you will output only a JSON object with nothing else in the following format: ${JSON.stringify(jsonFormat, null, 2)}.If the end time is not specified, fill it in with the start time.
Do not remove any attributes. Leave blank if unknown but try to answer with these suggestions.
Always add a brief description and the fact that this event is created by ai. This description is not a continued conversation, just a description
The current date is ${currentTime} and the timezone is ${currentTimezone}. 
You can respond normally when not specifically ask to create a new event.


`
);

// test stuff
let user1 = "Add Mcdonalds on next Saturday for me at 9 am";
let user4 = "Mark wants to hang out at Mcdonalds next Saturday"
let user2 = "Where am I? ";
let user3 = "I need help ";
(async () => {
  rag.inputChat(user1).then(value=>console.log(user1,value)).catch(reason=>console.log(reason));
  rag.inputChat(user2).then(value=>console.log(user2,value)).catch(reason=>console.log(reason));
  rag.inputChat(user3).then(value=>console.log(user3,value)).catch(reason=>console.log(reason));
  rag.inputChat(user4).then(value=>console.log(user4,value)).catch(reason=>console.log(reason));

})();

module.exports = {Gemini_Agent};



