const Groq = require("groq-sdk")
require ('dotenv').config({path:'../.env'})

//const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

const client = new Groq({});

//parameters for groq
var model = "llama3-8b-8192";
var history = [];
var max_tokens = 100;
var temperature = 1;
var stream = false;

async function initChat(system = {role: "system", content: "You are an assistant and also Frankenstein's monster."}) {
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
	history.push(message);
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
inputChat("Is your name Frankenstein or Frankeinstein's monster?").then(value=>console.log(value)).catch(reason=>console.log(reason));
inputChat("oh what is your real name?").then(value=>console.log(value)).catch(reason=>console.log(reason));
inputChat("do you know my name").then(value=>console.log(value)).catch(reason=>console.log(reason));
module.exports = { inputChat, initChat };



