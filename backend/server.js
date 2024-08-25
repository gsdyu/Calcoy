const express = require("express");
const server = express();
const port = 3000;

server.get('/', (req, res) => {
	res.send("timewise backend using node express");
});

// files in the public folder will be accessible by the public
// ex: localhost:${port}/images/vampire.jpg
server.use(express.static("public"));

server.listen(port, () => {
	console.log("timewise backend on port " + port);
});
