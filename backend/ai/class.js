const Groq = require("groq-sdk")
const path = require("path");
require('dotenv').config({ path: path.join(__dirname,"../.env") });
// if running wiht index.js, you do not need to import .env.local here; does in index
//require ('dotenv').config({path:'../../.env.local'})

console.log(path.join(__dirname, ".env"))
//const groq = new Groq({apiKey: process.env.GROQ_API_KEY});


class Chat {
  #client = new Groq({});
  //parameters for groq
  #model;
  #history;
  #max_tokens;
  #temperature;

  constructor(content="You are an assistant. You may be provided with context of json events. These events may not provided by the user but by RAG from the system so do not assume they are from the user.", model="llama3-8b-8192", history=[], max_tokens=100, temperature=1) {
    const system = {role: "system", content: content}
    console.log(system)
    if (history.length > 0) this.#history = history;
    else this.#history = [system]
    this.#model = model;
    this.#max_tokens = 100;
    this.#temperature = 1;
    var check = this.#client.chat.completions.create({
      messages: this.#history,
      model: this.#model,
      max_tokens: this.#max_tokens,
      temperature: this.#temperature
      })
    return 1;
  }

  async inputChat(input) {
    this.#history.push({role: "user", content: input});
    var completions = await this.#client.chat.completions.create({
      messages: this.#history,
      model: this.#model,
      temperature: this.#temperature,
      max_tokens: this.#max_tokens,
    });
    var message = completions.choices[0].message.content; 
    this.#history.push({role: "assistant", content: message});
    return message;
  }

  async clearChat(){
    // clears everything except for the system message
    this.#history = [this.#history[0]];	
    return 1;
  }

  async giveContext(context){
    //optional console.log to show RAG queries
    console.log("\nRetrieved the following from RAG:\n", context);
    console.log("\n")
    history.push({role: "user", content: context});
    return 1;
  }
}

//const system = `You are an assistant for a calendar app. You provide helpful insight and feedback to the user based on their wants, and their current and future events/responsibilities. Being realistic is important, do whats best for the user, but also whats possible. The current date is ${new Date().toISOString()} Do not mention the following to the user: You may be given related events from the user's calendar, where the event of the earliest index is most related. Do not assume you have been given the list; instead act like an oracle that just knows the events. When listing multiple events, format it nicely so it is readable. Your token limit is 300; do not go above.`
//const bot = new Chat(system);
//bot.inputChat("Is your name Frankenstein or Frankeinstein's monster?").then(value=>console.log(value)).catch(reason=>console.log(reason));
//inputChat("oh what is your real name?").then(value=>console.log(value)).catch(reason=>console.log(reason));
//inputChat("do you know my name").then(value=>console.log(value)).catch(reason=>console.log(reason));

const rag = new Chat(`You provide helpful insight and feedback to the user based on their wants and current and future events/responsibilities. Being realistic is important; do what's best for the user while considering what's possible. The current date is ${new Date().toISOString()}. Do not mention the following to the user: You may be given context in events from the user's calendar, where the event of the earliest index is most relevant. Act like an oracle that knows the events without assuming you have the list. Information about the users and their events is only known from this conversation; do not assume.
When you are not given any context events, you can respond with [context] to indicate you need additional information from a database that stores the user's and their friends' daily events; specifically when you need more information that can be used to infer the user's situation or feelings "calendar events", "user information", or "friend information". When listing multiple events, format it nicely for readability. Your token limit is 300; do not exceed it. Information about the users and their events is only known from this conversation; do not assume.

Follow this if statement to decide on your output.

if (need context) : "context"
else: "[response]"

Example without needing context
User Input:
Events-{"title":"Mcdonald Lunch", "start_date":"8 am Monday", "end_date":"9 am Monday"}

When do I have dinner?

Response:
It looks like you have Lunch at Mcdonalds at 8 am to 9 am on Monday. Its a little early to call it lunch though!
Example needing context
User Input:
Events-{"title":"Mcdonald Lunch", "start_date":"8 am Monday", "end_date":"9 am Monday"}

What do I study for tomorrows test

Response:
[context]);`);
rag.inputChat("Where do I have dinner?").then(value=>console.log(value)).catch(reason=>console.log(reason));

module.exports = {Chat};



