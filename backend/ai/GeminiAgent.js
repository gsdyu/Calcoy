const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require('dotenv').config({ path: path.join(__dirname,"../.env") });
const {createEmbeddings} = require('../ai/embeddings');
const {chatAll, chat_createEvent, chat_context, jsonEvent} = require('./prompts')

class GeminiAgent {
  #genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  #client
  //parameters for groq
  #system_message
  #config
  #model
  #responseSchema
  #history;

  constructor({content="You are frankenstein monster as an assistant", model="gemini-1.5-flash", history=[], maxOutputTokens=100, temperature=1, candidateCount=1, responseMimeType="text/plain", responseSchema=undefined} = {}) {

    this.#system_message = content
    if (history.length > 0) this.#history = history;
    else this.#history = []
    this.#model = model;
    this.#config = {
      candidateCount: candidateCount,
      maxOutputTokens: maxOutputTokens,
      temperature: temperature,
      response_mime_type: responseMimeType,
      response_schema: responseSchema
    }

    this.#client = this.#genAI.getGenerativeModel({ 
      model: this.#model,
      systemInstruction: this.#system_message,
      generationConfig: this.#config,
    })
    return 1;
  }

  getHistory() {
    return this.#history;
  }

  setHistory(history) {
    this.#history = history
  }

  getSystem() {
    return this.#system_message;
  }

  async inputChat({input, context, file, useHistory = true} = {}) {
    // if bot outputs a json string, it will be parsed into json
    let real_input = input
    if (context) real_input += `\n\nEvents - ${context}`
    let parts = [{text: real_input}]
    if (file) { 
      const filePart = {inlineData: {data: file.buffer.toString('base64'), mimeType: file.mimetype}}
      parts.push(filePart)
    }

    let history = [{role: "user", parts: parts}];
    if (useHistory) {
      this.#history = [...this.#history, {role: "user", parts: parts}];
      history = this.#history 
    }
    var result = await this.#client.generateContent({
      contents: history,
      generationConfig: this.#config,
    });
    let message = result.response.text(); 
    /** Miles part, need to comment out since wordCount here counts characters, not words
     * also, the max tokens is not necessarily based of words.
     * also, problem is not that the model will go above 100 tokens, but it will not finish a 
     *   its sentence with 100 tokens
    const wordCount = message.split('').length;
    if (wordCount > 100) {
      message = message.split('').slice(0,100).join('')+'...Sorry, I cannot provide a response that is beyond 100 words. Please try again.';
    }
     **/
    if (useHistory) this.#history = [...this.#history, {role: "model", parts: [{text: message}]}];
    try {
      message=JSON.parse(message);
    } catch (error) {
      console.log(error)
    }
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
      query += "True";
      break
    case 'near':
      query += "start_time between NOW() - INTERVAL '7 days' AND NOW() + INTERVAL '7 days'";
      break
    case 'future':
      query += "start_time >= NOW()";
      break
    case 'past':
      query += "start_time <= NOW()";
      break
    case 'week':
      query += `start_time BETWEEN date_trunc('week', NOW()) AND date_trunc('week', NOW()) + INTERVAL '7 days'`;
      break;
    case 'month':
      query += `start_time BETWEEN date_trunc('month', NOW()) AND date_trunc('month', NOW()) + INTERVAL '1 month'`;
      break;
    case 'year':
      query += `start_time BETWEEN date_trunc('week', NOW()) AND date_trunc('week', NOW()) + INTERVAL '1 year'`;
      break;
    default:
      console.error(`Context Error: Given an invalid time: ${json_request.time}`)
  }
  return query 
}

// testing stuff at the bottom, not necessary


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

const contextAgent = new GeminiAgent({content: chat_context})
const createAgent = new GeminiAgent({content:chat_createEvent, responseSchema:jsonEvent, responseMimeType: "application/json"});
//const chatAgent = new GeminiAgent({content:chatAll});

//(async () => {
  //console.log(await createAgent.inputChat("new event on tuesday"))

  
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


module.exports = {GeminiAgent, handleContext};



