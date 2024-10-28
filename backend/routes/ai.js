const { authenticateToken } = require('../authMiddleware');
const { inputChat, initChat, clearChat, giveContext } = require('../ai/chat');
const { createEmbeddings } = require('../ai/embeddings');

module.exports = (app, pool) => {
  // Create event route
  app.get('/ai', async (req, res) => {
	  res.send({"status":"ready"});
  })
  app.post('/ai', authenticateToken, async (req, res) => {
    try {
      const userInput = req.body.message;
      const userId = req.user.userId;
      //const userId = req.user.userId;
      if (!userInput) {
		    return res.status(400).send({error: "Input is required."} );
      }
      if (Array.isArray(userInput)) {
        return res.status(400).send({error: "Invalid input: arrays are not handled. please provide string"})
      }
      createEmbeddings(userInput)
        .then(embed => {
          pool.query(`
          SELECT user_id, title, description, start_time, end_time, location, frequency, calendar, time_zone
          FROM events
          WHERE user_id=${userId}
          ORDER BY embedding <-> '${JSON.stringify(embed[0])}'
          LIMIT 5;`)
            .then(context => {
              //formattedContext is almost same logic as frontend CalendarApp with formattedEvents variable. Converts global time from database to 
              //local time
              const formattedContext = context.rows.map(event => {
                const startTime = new Date(event.start_time);
                const endTime = new Date(event.end_time);
                return {
                  ...event,
                  date: startTime.toLocaleDateString(),
                  start_time: startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
                  end_time: endTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
                };
              });
              giveContext(JSON.stringify(formattedContext));
              const response = inputChat(userInput, userId)
                .then(response => {
                  //optional console.log to show groq llm response. the formatting of the 
                  //response here is currently more accurate syntax-wise than displayed on 
                  //frontend chatbot. Oct 13, 24

                  // if there is eventdetails returned from inputchat
                  if (response.title && response.start_time && response.end_time) {
                    const eventDetailsString = JSON.stringify({
                      title: response.title,
                      description: response.description || '',
                      start_time: response.start_time,
                      end_time: response.end_time,
                      location: response.location || '',
                      frequency: response.frequency || '',
                      calendar: response.calendar || '',
                      time_zone: response.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone
                    });

                    return res.send({
                      message: `AI has created an event for you. Please confirm or deny. Details: ${eventDetailsString}`,
                    });
                  } else {
                    // If no event details, send a regular AI message
                    console.log("Response from LLM:");
                    console.log(response, "\n");
                    return res.send({ message: response });
                  }
                })
                .catch(error => {
                  console.error("An error occurred getting the chatbot request: ", error); 
                })
            })
            .catch(error => {
              console.error("An error occurred while doing RAG: ", error); 
            })
        })
        .catch(error => {
          console.error("An error occurred while creating embedding: ", error); 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: `An error occurred while processing your request. ${error}` });
    }
  });
}
