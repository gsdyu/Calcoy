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
		late_chunking: true,
		embedding_type: "float",
		input: input
	};
	const response = await axios.post(url, data, {headers})
		.then(response=> {
      console.log(response.data.usage);
      console.log(response.data)
      return response.data.data.map(item => {return item.embedding})
    })
		.then(data=>data)
		.catch(error=>console.error(error));
	return response;
}

  /**
createEmbeddings(["hello", "there"])
	.then(response=>console.log(JSON.stringify(response[0])))
	.catch(error=>console.error(error));
  */
module.exports = { createEmbeddings };
