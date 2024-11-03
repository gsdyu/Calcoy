const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require('dotenv').config({ path: path.join(__dirname,"../.env") });
const {createEmbeddings} = require('../ai/embeddings');
const {chatAll, chat_createEvent} = require('./prompts')

class GeminiAgent {
  #genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  #client
  //parameters for groq
  #system_message
  #config
  #model
  #history;

  constructor({content="You are frankenstein monster as an assistant", model="gemini-1.5-flash", history=[], maxOutputTokens=100, temperature=1, candidateCount=1, responseMimeType="application/json", responseSchema=undefined} = {}) {

    this.#system_message = content
    if (history.length > 0) this.#history = history;
    else this.#history = []
    this.#model = model;
    this.#config = {
      candidateCount: candidateCount,
      maxOutputTokens: maxOutputTokens,
      temperature: temperature,
      response_mime_type: responseMimeType,
    }
    console.log(temperature)

    this.#client = this.#genAI.getGenerativeModel({ 
      model: this.#model,
      systemInstruction: this.#system_message,
      generationConfig: this.#config
    });
    return 1;
  }

  getHistory() {
    return this.#history;
  }

  getSystem() {
    return this.#system_message;
  }

  async inputChat(input, context, maxOutputTokens, temperature ) {
    let real_input = input
    if (context) real_input += `\n\nEvents - ${context}`
    this.#history.push({role: "user", parts: [{text: real_input}]});
    var result = await this.#client.generateContent({
      contents: this.#history,
      generationConfig: this.#config
    });
    var message = result.response.text(); 
    this.#history.push({role: "model", parts: [{text: message}]});
    return message;
  }

  async clearChat() {
    this.#system_message = content
    const system = {role: "user", parts: [{text: this.#system_message}]}
    if (history.length > 0) this.#history = history;
    else this.#history = [system]
  }

}

 function handleContext(request) {
  // handles context type request 
  if (typeof request === "string") {
    try {
    json_request = JSON.parse(request)
    } catch (error) {
      console.error("Error: Invalid Json string", error);
      return;
    }
  } else json_request = request;
  // placeholder
  if (json_request.type != "context") {
    console.error(`Context Error: Given a ${json_request.type} for a context function`)
    return
  }
  let query = ``
  switch (json_request.time) {
    case 'anytime':
      query += "True"
      break
    case 'near':
      query += "start_time between NOW() - INTERVAL '7 days' AND NOW() + INTERVAL '7 days'"
      break
    case 'future':
      query += "start_time >= NOW()"
      break
    case 'past':
      query += "start_time <= NOW()"
      break
    default:
      console.error(`Context Error: Given an invalid time. ${json_request.time}`)
  }
  return query 
}

//const system = `You are an assistant for a calendar app. You provide helpful insight and feedback to the user based on their wants, and their current and future events/responsibilities. Being realistic is important, do whats best for the user, but also whats possible. The current date is ${new Date().toISOString()} Do not mention the following to the user: You may be given related events from the user's calendar, where the event of the earliest index is most related. Do not assume you have been given the list; instead act like an oracle that just knows the events. When listing multiple events, format it nicely so it is readable. Your token limit is 300; do not go above.`
//const bot = new Chat(system);
//bot.inputChat("Is your name Frankenstein or Frankeinstein's monster?").then(value=>console.log(value)).catch(reason=>console.log(reason));
//inputChat("oh what is your real name?").then(value=>console.log(value)).catch(reason=>console.log(reason));
//inputChat("do you know my name").then(value=>console.log(value)).catch(reason=>console.log(reason));

const jsonEvent = {
	"title": "",
	"description": "",
	"start_time": "<event start time>",
	"end_time": "<event end time>",
	"location": "<event location, just put N/A if none are given>",
	"frequency": "<event frequency, default is Do not Repeat >",
	"calendar": "<which calendar the event is for, default is Personal unless given>",
	"date": "<date scheduled like '01/01/24', or 'unknown', if not sure>"
  };

console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)
const currentTime = new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// test stuff
let user3 = "I need help ";
let user1 = "{content: 'context', time: 'past'}";
let user2 = "When is Christmas";

genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

schema = {
  "type": "ARRAY",
  "items": {
    "type": "OBJECT",
    "description": "Properties of events needed to be saved on a calendar",
    "properties": {
      "title": {"type": "STRING"},
      "description": {"type": "STRING"},
      "date": {"type": "STRING"},
      "start_time": {"type": "STRING"},
      "end_time": {"type": "STRING"},
      "frequency": {"type": "STRING"},
      "location": {"type": "STRING"},
      "calendar": {"type": "STRING"},
      "allday": {"type": "BOOLEAN"},
    },
    "required": ["type", "title", "date", "start_time", "end_time", "allday", "calendar", "frequency"]
  }
}

//const createAgent = new GeminiAgent({content:chat_createEvent, responseSchema:jsonEvent});
//const chatAgent = new GeminiAgent({content:chatAll});

//(async () => {

//  rag.inputChat(user1).then(value=>(console.log(rag.getHistory()))).catch(reason=>console.log(reason));
  /*
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You will respond as a music historian, demonstrating comprehensive knowledge across diverse musical genres and providing relevant examples. Your tone will be upbeat and enthusiastic, spreading the joy of music. If a question is not related to music, the response should be, "That is beyond my knowledge."`
  })
  const response = await model.generateContent("If a person was born in the sixties, what was the most popular music genre being played? List five songs by bullet points")
  const res = await response.response.text()
  console.log(res)
  */
//})();


module.exports = {GeminiAgent, handleContext, jsonEvent};



