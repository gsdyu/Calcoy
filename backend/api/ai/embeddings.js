const axios = require('axios')
const path = require("path");
require('dotenv').config({ path: path.join(__dirname,"../../.env") });

async function createEmbeddings(input) {
  // gemini embedding model. using fetch request rather than @google/generative-ai js library as the library does not seem to support outputDimensionality
	const headers = {
		"Content-Type": "application/json",
	};
	const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`;
	const data = {
		model: "models/text-embedding-004",
    content: {
      parts: [{
        text: input}],},
		taskType : "SEMANTIC_SIMILARITY",
		outputDimensionality: 128,
	};
	const response = await axios.post(url, data, {headers})
		.then(response=> {
      //add an argument to show token usage or not to function
      //console.log(response.data.usage);
      //console.log(response.data)
      return response.data.embedding.values
    })
		.catch(error=>console.error(error));
	return response;
}

const result = createEmbeddings('dog').then(response=>console.log(response));
  /**
createEmbeddings(["hello", "there"])
	.then(response=>console.log(JSON.stringify(response[0])))
	.catch(error=>console.error(error));
  */
module.exports = { createEmbeddings };
