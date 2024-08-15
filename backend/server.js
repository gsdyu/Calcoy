//test comment to initialize server backend
import {createServer} from "node:http";

let server = createServer((request, response) => { 
	response.writeHead(200, {"Content-Type": "text/html"});
	//the character after write is a grave accent: `(not a quote: ')
	response.write(`
	<h1>timewise</h1>
		<p>back back back</p>	
		<p>end end end</p>`);
	response.end();
});
server.listen(8000)
console.log("timewise backend is working for localhost:8000");
