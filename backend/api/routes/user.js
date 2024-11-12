const express = require('express');
const router = express.Router();
const fs = require("node:fs");

router.get('/',(req,res) => {
	res.send("Accessing user");
})
//temporary route to handle potentially storing user data
//is currently able to store user data locally through files
//need to implement storing the data through a database
router.route('/:name').get((req, res) => {
	//can implement trying to read off the local storage for the given name
	res.json(req.params);
}).post((req, res) => {
	name = req.params.name;
	path = "user_json/"+name+".json";
	fs.stat(path, (err, stats) => {
		if (err) {
			if (err.errno!=-4058){
				console.log(err);
				res.send("An error occurred trying to find "+ name);
				return;
			}
		}
		if (stats) {
			res.send(name+" has already been written");
			return;
		}
	
		let user = {"name": name};
		fs.writeFile(path, JSON.stringify(user), (content, err) => {
			if (err){
				res.send("There was an error trying to write "+name);
				return;
			}
			res.send(name+" has successfully been written");
		});		
	});
}).delete((req, res) => {
	name = req.params.name;
	path = "user_json/"+name+".json";
	fs.stat(path, (err, stats) => {
		if (err) {
			if (err.errno!=-4058){
				console.log(err);
				res.send("An error occurred trying to find "+ name);
				return;
			}
			res.send(name+" does not exist");
			return;
		}
		fs.unlink(path, (err) => {
			if (err){
				res.send("There was an error trying to delete "+name);
				return;
			}
			res.send(name+" has successfully been deleted");
		});
	});
}).put((req, res) => {
	res.status(404).send("put method not implemented yet");
});

module.exports = router;
