const { authenticateToken } = require('../authMiddleware');
const { inputChat, initChat, clearChat, giveContext } = require('../ai/chat');
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
        "type": "CreateEvent",
        "title": "",
        "description": "",
        "start_time": "<event start time>",
        "end_time": "<event end time>",
        "location": "<event location, just put N/A if none are given>",
        "frequency": "<event frequency, default is Do not Repeat >",
        "calendar": "<which calendar the event is for, default is Personal unless given>",
        "time_zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        "date": "<date scheduled like '01/01/24', or 'unknown', if not sure>"
        };

      const currentTime = new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const rag = new GeminiAgent(content = `You provide helpful insight and feedback to the user based on their wants and current and future events/responsibilities. Being realistic is important; do what's best for the user while considering what's possible. The current date is ${currentTime} and the timezone is ${currentTimezone}.  Do not mention the following to the user: You may be given context in events from the user's calendar, where the event of the earliest index is most relevant. Act like an oracle that knows the events without assuming you have the list. Information about the users and their events is only known from this conversation; do not assume.

      Rather than give a response, you have the option to output a json file that can be preprocessed by the server to satisfy a general function. The two general function available are Context, to get more information about a user's query through a database, and CreateEvent, which creates an event for the user.
      ___
      Context:

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
      __





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

      CreateEvent:

      // this part is just placeholder for CreateEvent prompt. feel free to replace

       When asked to create new events, you will output only a JSON object with nothing else in the following format: ${JSON.stringify(jsonFormat, null, 2)}.If the end time is not specified, fill it in with the start time.
      Do not remove any attributes. Leave blank if unknown but try to answer with these suggestions.
      Always add a brief description and the fact that this event is created by ai. This description is not a continued conversation, just a description
      The current date is ${currentTime} and the timezone is ${currentTimezone}. 
      You can respond normally when not specifically ask to create a new event.
      ___

      When listing multiple events, format it nicely for readability. Your token limit is 300; do not exceed it. Information about the users and their events is only known from this conversation; do not assume.

      `
      );
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
