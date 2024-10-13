const axios = require('axios')
const path = require("path");
require('dotenv').config({ path: path.join(__dirname,"../.env") });

async function createEmbeddings(input, key = process.env.JINA_API_KEY) {
	const headers = {
		"Content-Type": "application/json",
		"Authorization": `Bearer ${key}`
	};

	const url = "https://api.jina.ai/v1/embeddings";
	const data = {
		model: "jina-embeddings-v3",
		task : "text-matching",
		dimensions: 128,
		late_chunking: false,
		embedding_type: "float",
		input: "hello there"
	};
  console.log(data, url, headers);
	axios.post(url, data, {headers})
		.then(response=>response.data.data[0].embedding)
		.then(data=>console.log(data))
		.catch(error=>console.error(error));
}

createEmbeddings("hello");
module.exports = { createEmbeddings };
