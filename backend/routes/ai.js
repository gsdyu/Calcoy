const { authenticateToken } = require('../authMiddleware');
const { GeminiAgent, handleContext } = require('../ai/GeminiAgent');
const { createEmbeddings } = require('../ai/embeddings');
const { chatAll } = require('../ai/prompts');

module.exports = (app, pool) => {
  // Create event route
  app.get('/ai', async (req, res) => {
	  res.send({"status":"ready"});
  })
  app.post('/ai', authenticateToken, async (req, res) => {
    try {

      const currentTime = new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // system prompt is in chatAll
      const rag = new GeminiAgent(content = chatAll);
      // gives embedding context of todays date
      const userInput = req.body.message;
      const userId = req.user.userId;
      //const userId = req.user.userId;
      if (!userInput) {
		    return res.status(400).send({error: "Input is required."} );
      }
      if (Array.isArray(userInput)) {
        return res.status(400).send({error: "Invalid input: arrays are not handled. please provide string"})
      }
      
      try {
        ai_func = JSON.parse(req.body.message)
      } 
      catch {
      }
      let response = await rag.inputChat(userInput)
      console.log(response)
      let ai_func 
      try {
        ai_func = JSON.parse(response)
      } 
      catch {
      }

      // if chatbot responds with a json, checks for which ai function handles

      if (ai_func?.type === "context") {
        // context handles rag
        let context_query = await handleContext(ai_func);
        console.log(context_query)
        createEmbeddings(userInput).then(embed => {
          let query = `SELECT user_id, title, description, start_time, end_time, location, frequency, calendar, time_zone,
            embedding <-> '${JSON.stringify(embed[0])}' as correlation
            FROM events
            WHERE user_id=$1 AND COALESCE(${context_query}, TRUE)
            ORDER BY embedding <-> '${JSON.stringify(embed[0])}'
            LIMIT 5;`
          pool.query(query, [ userId]
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
            console.log(formattedContext)
            const context_response = await rag.inputChat(userInput, JSON.stringify(formattedContext))
            return res.send({message: context_response})
          })
        })
      } else if (ai_func?.type === 'createEvent'){
        // starts workflow for chatbot creating an event
        console.log(ai_func.calendar)
        const eventDetailsString = JSON.stringify({
          title: ai_func.title,
          description: ai_func.description || '',
          start_time: ai_func.start_time,
          end_time: ai_func.end_time,
          location: ai_func.location || '',
          frequency: ai_func.frequency || '',
          calendar: ai_func.calendar || '',
          allDay: ai_func.allDay || false,
          time_zone: ai_func.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        console.log(eventDetailsString)
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
