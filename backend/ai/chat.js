const Groq = require("groq-sdk")
require ('dotenv').config({path:'../.env'})

//const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

var model = "llama3-8b-8192";
var history = [];
async function initChat(system = {role: "system", content: "You will talk like Hal 9000"}) {
	const groq = new Groq({});
	var model = "llama3-8b-8192"
	history.push(system);
	var check = groq.chat.completions.create({
			messages: history,
			model: model,
		}
	)
	return 1;
}

async function inputChat(input) {

}

function clearChat(priorSystem){
	if (typeof(priorSystem) != typeof(true)){
		throw new TypeError("Input should be actual boolean");
	}
	if (priorSystem) {
		history = [history[0]];	
	}
	history = [];
	return 1;
}

initChat().then(value=>console.log(value)).catch(reason => {console.log("Caught failure "+ reason); return "nothing";});

async function main() {
	const completion = await groq.chat.completions.create({
		messages:[
			{
				role: "user",
				content: "Explain the importance of fast language models",
			}
		],
		model: "llama3-8b-8192",
	});
	
	console.log(completion.choices[0]?.message?.content || "error");
}



