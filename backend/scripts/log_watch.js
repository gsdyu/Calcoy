const fs = require('fs');

const filePath = `./logs/context.txt`;

fs.watch(filePath, (eventType, filename) => {
 const data = fs.readFileSync(filePath, 'utf8');
 console.log(`\n-----\n${data}`)
})

console.log("watching\n")
