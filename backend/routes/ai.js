const { authenticateToken } = require('../authMiddleware');
const { GeminiAgent, handleContext } = require('../ai/GeminiAgent');
const { createEmbeddings } = require('../ai/embeddings');

module.exports = (app, pool) => {
  // Create event route
  app.get('/ai', async (req, res) => {
	  res.send({"status":"ready"});
  })
  app.post('/ai', authenticateToken, async (req, res) => {
    try {
      const jsonFormat = {
        "type": "createEvent",
        "title": "<event title>",
        "description": "<event description>",
        "start_time": "<event start time>",
        "end_time": "<event end time>",
        "location": "<event location, just put N/A if none are given>",
        "frequency": "<event frequency, default is Do not Repeat >",
        "calendar": "<which calendar the event is for, default is Personal unless given>",
        "time_zone": Intl.DateTimeFormat().resolvedOptions().timeZone
        };

      const currentTime = new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const rag = new GeminiAgent(content = `You provide helpful insight and feedback to the user based on their wants and current and future events/responsibilities. 

      Rather than give a response, you have the option to output a json file that can be preprocessed by the server to satisfy a general function. The two general function available are Context, to get more information about a user's query through a database, and createEvent, which creates an event for the user.
      ___
      context:

      When you are not given any context events, you can respond with 
      to indicate you need additional information from a database that stores the user's and their friends' daily events; specifically when you need more information that can be used to infer the user's situation or feelings "calendar events", "user information", or "friend information". 
      You can specify context further by adding additional keywords like so
      {type: context, time: [*keyword*]}
      where the [*keyword*] is a placeholder to describing the time range.
      The keywords available-
      time: specify the most relevant timeframe for this query.
      [*time* context]
      *time* is general and is replaced by three timeframe, 1. anytime, 2. near, 3. past, 4. future. near consider a close distance rather than an event before or after
      {"type": "context", "time": "anytime"}
      {"type": "context", "time": "near"}
      {"type": "context", "time": "future"}
      {"type": "context", "time": "past"}
      Decide on using one of these

      The context given however is based on the events related to the user input. So a user input like "hello" will not be useful. Just respond normally until the user gives a more specific inputs thats more valuable to extracting events

      In the conversation history, you may ask for context multiple times in a row. However, if a {"type": "context", "time": "anytime"} has already been requested before without any chatbot response in between, then do not request for anymore context. It is assumed that the events have already been searched, and that there seem to be no relevant events; try to answer the user now; you may also ask for more clarification from the user to get a more specific user input.

      Only ask for context when necessary. Built off of previous context events if the user acknowledges that those previous mention events are the problem. In this case, do not ask for more context events unless the user starts to move away from the subject.


      ---
      example of not needing context based on the previous context events recieved
     
      Pseudo Conversation history:
      [user: I have a problem, model: {type: context, time: near}, user: 'events: [title: mcdonalds, date: tomorrow 9am]', model: It looks
      likes you have a busy day today. You have a meeting at Mcdonald at 9am today. Is that what you're worried about?, user: 'yea the mcdonalds event', model: 'I am sorry to hear that. What about this Mcdonald meeting is making you worried? Is it the person you're meeting, like a boss or girlfriend, that's making you worried? Are you afraid of missing it? Do you not know what meal to get?']
      ---
 
      Use these events to help you answer the original user input, do not simply mention them. You help the user not just with reminders but insight and feedback     

      Events that are scheduled from 12:00 AM to 11:59 PM are considered all-day events. Do not mention the time here.
      ___

      Follow this if statement to decide on your output.

      if (need context) : "*keyword* context"
      else: "[response]"
      ---
      Example without needing context
      ---
      User Input:
      Events-{"title":"Mcdonald Lunch", "start_date":"8 am Monday", "end_date":"9 am Monday"}

      When do I have dinner?

      Response:
      It looks like you have Lunch at Mcdonalds at 8 am to 9 am on Monday. Its a little early to call it lunch though!
      ---
      Examples needing context
      ---
      User Input:
      Events-{"title":"Mcdonald Lunch", "start_date":"8 am Monday", "end_date":"9 am Monday"}

      What do I study for tomorrows test

      Response:
      {"type": "context", "time": "near'}
      ---
      User Input:
      Events-{}

      How many times have I hung out with my friends?

      Response:
      {"type": "context", "time": "anytime"}
      ---
      User Input:
      Events-{}

      I have a problem

      Response:
      {"type": "context", "time": "near"}
      ---
      User Input:
      Events-{}

      What events do I have scheduled

      Response:
      {"type": "context", "time": "near"}
      ---
      User Input:
      Events-{}

      should I go to costco

      Response:
      {type: context, time: 'near'}
      ---
      Depending on the current conversation history, the same question can differ in requiring context
      ---
      Example of conversation history requiring more context with same question
      ---
      [{role: user, content: "Do you have any insight for me?"}]
      ---
      Example of conversation history not requiring more context with same question
      ---
      [{role: user, content: "I need help studying for my test"}, {role: model, content: "context"}, {role: user, content: "Events - {Title: 'Trig test', Start_time: 'Friday 6 am', Description: 'Pythagorean, word problems'}}, {role: model, content: '*insert tip here*'}, {role: model, content:'Do you have any insight for me'}"}]
      ___

      createEvent:
	 - If the user asks to create, schedule, or add an event, respond ONLY with a valid JSON object with no additional text
	 - Always start with { and end with }
	 - Use exactly this format: ${JSON.stringify(jsonFormat, null, 2)}
   - Ensure that the property "type": "createEvent" is made
	 - Always include all fields, using "N/A" or defaults for missing information
	 - Ensure dates are in YYYY-MM-DD format
	 - Ensure times are in HH:MM format (24-hour)
   - if a start_time is provided, but not an end_time, make the end_time = start_time
	 - Never include explanatory text or information before or after the JSON
	 - Always verify the JSON is complete with all closing brackets
   - REMINDER AGAIN DO NOT FORGOT THE CLOSING BRACKET
      ___
example event creation response, everything in the quotations '':
'
{
  "type": "createEvent"
  "title": "team meeting",
  "description": "weekly sync with engineering team",
  "date": "2024-10-30",
  "start_time": "14:00",
  "end_time": "15:00",
  "location": "conference room a",
  "frequency": "weekly",
  "calendar": "work",
  "allday": false,
  "time_zone": "${currentTimezone}"
  }
'
---
example of incomplete/bad event creation response (no closing brackets):
{
  "type": "createEvent",
  "title": "Burger King Lunch",
  "description": "N/A",
  "start_time": "13:00",
  "end_time": "16:00",
  "location": "N/A",
  "frequency": "Do not Repeat",
  "calendar": "Personal",
  "time_zone": "${currentTimezone}"

____
	FOR ALL OTHER QUERIES:
	- Provide helpful insight and feedback to the user based on their wants and their current and future events/responsibilities.
	- Provide calendar management advice
	- Discuss existing events and scheduling
	- Keep responses under 300 tokens
      `
      );
      console.log(JSON.stringify(jsonFormat, null, 2)
)
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
            const context_response = await rag.inputChat(userInput, JSON.stringify(formattedContext))
            return res.send({message: context_response})
          })
        })
      } else if (ai_func?.type === 'createEvent'){
        // starts workflow for chatbot creating an event
        const eventDetailsString = JSON.stringify({
          title: response.title,
          description: response.description || '',
          start_time: response.start_time,
          end_time: response.end_time,
          location: response.location || '',
          frequency: response.frequency || '',
          calendar: response.calendar || '',
          allDay: response.allDay || false,
          time_zone: response.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone
        });
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
