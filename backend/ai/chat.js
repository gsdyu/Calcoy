const Groq = require("groq-sdk")
// if running wiht index.js, you do not need to import .env.local here; does in index
//require ('dotenv').config({path:'../../.env.local'})

//const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

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
		max_tokens: 100,
		})
	return 1;
}

async function inputChat(input) {

	history.push({role: "user", content: input});
	var completions = await client.chat.completions.create({
		messages: history,
		model: model,
		temperature: temperature,
		max_tokens: max_tokens,
	});
	var message = completions.choices[0].message.content; 
	history.push({role: "assistant", content: message});
	return message;
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

const system = `You are an assistant for a calendar app. You provide helpful insight and feedback to the user based on their wants, and their current and future events/responsibilities. Being realistic is important, do whats best for the user, but also whats possible. The current date is ${new Date().toISOString()} Do not mention the following to the user: You may be given related events from the user's calendar, where the event of the earliest index is most related. Do not assume you have been given the list; instead act like an oracle that just knows the events. When listing multiple events, format it nicely so it is readable. Your token limit is 300; do not go above.`
initChat(system);
//inputChat("Is your name Frankenstein or Frankeinstein's monster?").then(value=>console.log(value)).catch(reason=>console.log(reason));
//inputChat("oh what is your real name?").then(value=>console.log(value)).catch(reason=>console.log(reason));
//inputChat("do you know my name").then(value=>console.log(value)).catch(reason=>console.log(reason));

module.exports = { inputChat, initChat, clearChat, giveContext};



