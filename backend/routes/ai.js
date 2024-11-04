const { authenticateToken } = require('../authMiddleware');
const { GeminiAgent, handleContext } = require('../ai/GeminiAgent');
const { createEmbeddings } = require('../ai/embeddings');
const { chatAll, chat_createEvent, chat_context, jsonEvent } = require('../ai/prompts');
const fs = require('fs');

const contextAgent = new GeminiAgent({content: chat_context, responseMimeType: "application/json"});
const chatAgent = new GeminiAgent({content: chatAll});
const createAgent = new GeminiAgent({content: chat_createEvent, responseSchema: jsonEvent, responseMimetype: "application/json"});

async function useRag(userInput, userId, context_query, pool) {
  let output = "Error in Rag"
  await createEmbeddings(userInput).then(async embed => {
    let query = `SELECT user_id, title, description, start_time, end_time, location, frequency, calendar, time_zone,
      embedding <-> '${JSON.stringify(embed[0])}' as correlation
      FROM events
      WHERE user_id=$1 AND COALESCE(${context_query}, TRUE)
      ORDER BY embedding <-> '${JSON.stringify(embed[0])}'
      LIMIT 5;`
    await pool.query(query, [ userId]
    ).then(async (context) => {
      const formattedContext = context.rows.map(event => {
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time)
        return {
          ...event,
          date: startTime.toLocaleDateString(),
          start_time: startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
          end_time: endTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        }
      })
      const textContext = formattedContext.map(context => `\n ${JSON.stringify(context)}`)
      // you can use a fileReader to read the context
      output = textContext;
      fs.writeFile('scripts/logs/context.txt',textContext.join('\n'), (err) => { if (err) {
          console.error("Error writing file: ", err);
        }
      })
    })
  })
  return output 
}
     
module.exports = (app, pool) => {
  // Create event route

  app.get('/ai', async (req, res) => {
	  res.send({"status":"ready"});
  })
  app.post('/ai', authenticateToken, async (req, res) => {
    try {

      const currentTime = new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;


      // gives embedding context of todays date
      const userInput = req.body.message;
      const userId = req.user.userId;
      //const userId = req.user.userId;
      //system prompt is in chatAll

      if (!userInput) {
		    return res.status(400).send({error: "Input is required."} );
      }
      if (Array.isArray(userInput)) {
        return res.status(400).send({error: "Invalid input: arrays are not handled. please provide string"})
      }
      const initial_context = await contextAgent.inputChat(userInput)
      let initial_events = ''
      if (initial_context.type === "none"){
      } else {
        initial_events = await useRag(userInput, userId, handleContext(initial_context), pool);
      }

      let response = await chatAgent.inputChat(userInput, initial_events)
      console.log(response)

      // if chatbot responds with a json, checks for which ai function handles

      if (response.type === "context") {
        return res.send({message: JSON.stringify(response)})
        
      } else if (response.type === 'createEvent'){
        // starts workflow for chatbot creating an event
        createAgent.setHistory(chatAgent.getHistory())
        const create_json = await createAgent.inputChat(userInput); 
        console.log(create_json)
        const eventDetailsString = JSON.stringify({
          title: create_json.title,
          description: create_json.description || '',
          start_time: create_json.start_time,
          end_time: create_json.end_time,
          location: create_json.location || 'N/A',
          frequency: create_json.frequency || 'Do not Repeat',
          calendar: create_json.calendar || 'Personal',
          allDay: create_json.allDay || false,
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        console.log(eventDetailsString)
        chatAgent.setHistory(createAgent.getHistory())
        return res.send({message: `AI has created an event for you. Please confirm or deny. Details: ${eventDetailsString}`})
      } else {
        return res.send({message: response})
      }
    }
    catch (error){ 
      console.error("Chatbot error: ", error)
      return res.status(500).json({error: 'Internal server error'});
    }
  })
}
