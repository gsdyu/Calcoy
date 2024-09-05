const OpenAI = require("openai");
require('dotenv').config({path:"../.env"});
openai = new OpenAI()

async function main() {
	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [{role: "user", content: "hello"}]});
	console.log(completion.choices[0].message);
}

//main();
var events = require("./test.json");
console.log(events);
