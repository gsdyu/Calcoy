const { authenticateToken } = require('../authMiddleware');
const { GeminiAgent, handleContext } = require('../ai/GeminiAgent');
const { createEmbeddings } = require('../ai/embeddings');
const { chatAll, chat_createEvent, chat_context, jsonEvent } = require('../ai/prompts');
const multer = require('multer');
const fs = require('fs');
const path = require("path");
require('dotenv').config({ path: path.join(__dirname,"../.env")});
const { GoogleAIFileManager } = require("@google/generative-ai/server")

const upload = multer({ storage: multer.memoryStorage()});
class SharedAgentsManager {
  constructor(pool) {
    this.pool = pool;
    
    this.fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    // shared agents
    this.contextAgent = new GeminiAgent({
      content: chat_context,
      responseMimeType: "application/json"
    });
    
    this.chatAgent = new GeminiAgent({
      content: chatAll
    });
    
    this.createAgent = new GeminiAgent({
      content: chat_createEvent,
      responseSchema: jsonEvent,
      responseMimeType: "application/json"
    });

    this.titleAgent = new GeminiAgent({
      content: `You are a chat title generator. Given a conversation message, create a brief, contextual title (max 50 chars) that captures the essence of what the conversation will be about. Respond with just the title, no extra text.`,
    });
  }

  // Load conversation history from database
  async loadConversationState(conversationId) {
    try {
      // get all messages for this conversation, ordered
      const result = await this.pool.query(
        `SELECT sender, content 
         FROM messages 
         WHERE conversation_id = $1 
         ORDER BY created_at ASC`,
        [conversationId]
      );

      // convert database messages to agent history format
      const messages = result.rows.map(row => ({
        role: row.sender === 'user' ? 'user' : 'model',
        parts: [{text: row.content}]
      }));

      // set histories for all agents
      this.contextAgent.setHistory(messages.filter(msg => 
        msg.parts[0].text.includes('"type":"context"')
      ));
      
      this.chatAgent.setHistory(messages);
      
      this.createAgent.setHistory(messages.filter(msg => 
        msg.parts[0].text.includes('"type":"createEvent"')
      ));

    } catch (error) {
      console.error('Error loading conversation history:', error);
      this.contextAgent.setHistory([]);
      this.chatAgent.setHistory([]);
      this.createAgent.setHistory([]);
    }
  }

  // generate title
  async generateAndUpdateTitle(conversationId, message) {
    try {
      const title = await this.titleAgent.inputChat({input: message});
      
      // Update the conversation title in the database
      await this.pool.query(
        `UPDATE conversations 
         SET title = $1 
         WHERE id = $2`,
        [title, conversationId]
      );
      
      return title;
    } catch (error) {
      console.error('Error generating/updating title:', error);
      return 'New chat';
    }
  }

  // Save message to database
  async saveMessage(conversationId, sender, content) {
    try {
      if (
        typeof content === 'string' &&
        (
          content.trim() === '{"type":"createEvent"}' ||
          content.includes('"type":"context"')
        )
      ) {
        // Do not save messages that are exactly {"type":"createEvent"} or include "type":"context"
        return;
      }

      await this.pool.query(
        `INSERT INTO messages (conversation_id, sender, content)
        VALUES ($1, $2, $3)`,
        [conversationId, sender, content]
      );
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // Create new conversation
  async createConversation(userId, title = 'New chat') {
    try {
      const result = await this.pool.query(
        `INSERT INTO conversations (user_id, title)
         VALUES ($1, $2)
         RETURNING id`,
        [userId, title]
      );
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Delete conversation and its messages
  async deleteConversation(conversationId) {
    try {
      await this.pool.query(
        'DELETE FROM conversations WHERE id = $1',
        [conversationId]
      );
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  async uploadFile(file) {
    const uploadResult = await fileManager.uploadFile(
    )
  }
}

async function useRag(userInput, userId, context_query, pool) {
  let output = "Error in Rag"
  await createEmbeddings(userInput).then(async embed => {
    let query = `SELECT user_id, title, description, start_time, end_time, location, frequency, calendar, time_zone,
      embedding <-> '${JSON.stringify(embed)}' as correlation
      FROM events
      WHERE user_id=$1 AND COALESCE(${context_query}, TRUE)
      ORDER BY embedding <-> '${JSON.stringify(embed)}'
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
      /*
      fs.writeFile('scripts/logs/context.txt',`${context_query}:\n${textContext.join('\n')}`, (err) => { if (err) {
          console.error("Error writing file: ", err);
        }
      })
      */
    })
  })
  return output 
}
     
module.exports = (app, pool) => {
  // Create event route
  const agentManager = new SharedAgentsManager(pool);

  app.get('/ai', async (req, res) => {
	  res.send({"status":"ready"});
  })
  app.post('/ai', authenticateToken, upload.single('file'), async (req, res) => {
    try {

      const userInput = req.body.text;
      const userId = req.user.userId;
      //const userId = req.user.userId;
      //system prompt is in chatAll
      let conversationId = req.body.conversationId;

      if (!userInput) {
		    return res.status(400).send({error: "Input is required."} );
      }
      if (Array.isArray(userInput)) {
        return res.status(400).send({error: "Invalid input: arrays are not handled. please provide string"})
      }

      // Track if this is a new conversation
      const isNewConversation = !conversationId;
      
      // create new conversation if none exists
      if (isNewConversation) {
        conversationId = await agentManager.createConversation(userId);
      }

      await agentManager.loadConversationState(conversationId);
      await agentManager.saveMessage(conversationId, 'user', userInput);

      // Generate title for new conversations after first message
      let title;
      if (isNewConversation) {
        title = await agentManager.generateAndUpdateTitle(conversationId, userInput);
      }

      const initial_context = await agentManager.contextAgent.inputChat({input: userInput});
      if (initial_context.type !== "none") {
        await agentManager.saveMessage(conversationId, 'model', JSON.stringify(initial_context));
      }
      console.log('context', initial_context)

      let initial_events = ''
      if (initial_context.type === "none"){
      } else {
        try { 
          initial_events = await useRag(userInput, userId, handleContext(initial_context), pool);
        } catch (error) {
          console.error("Error calling RAG. Possibly out of embed token", error)
        }
      }

      let response = await agentManager.chatAgent.inputChat({input: userInput, context: initial_events, file: req.file});

      await agentManager.saveMessage(conversationId, 'model', typeof response === 'string' ? response : JSON.stringify(response));

      // if chatbot responds with a json, checks for which ai function handles

      if (response.type === "context") {
        console.log('context')
        
      } else if (response.type === "createEvent"){
        // starts workflow for chatbot creating an event
        agentManager.createAgent.setHistory(agentManager.chatAgent.getHistory());
        const create_jsons = await agentManager.createAgent.inputChat({input: userInput, temperature: 0});
        console.log(create_jsons)
        const eventDetailsString = (create_jsons.map(event => JSON.stringify({
          type: "createEvent",
          title: event.title,
          description: event.description || '',
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location || 'N/A',
          frequency: event.frequency || 'Do not Repeat',
          calendar: event.calendar || 'Personal',
          time_zone: Intl.DateTimeFormat().resolvedOptions().timezone,
          ai: 'true'}
        )))
        
        let sendString = eventDetailsString[0]
        console.log(sendString)

        await agentManager.saveMessage(conversationId, 'model', sendString);
        
        agentManager.chatAgent.setHistory(agentManager.createAgent.getHistory());

        return res.send({message: `AI has created an event for you. Please confirm or deny. Details: ${sendString}`, conversationId})
      } else {
        return res.send({
          message: response,
          conversationId,
          ...(title && { title })
        });
      }
    }
    catch (error){ 
      console.error("Chatbot error: ", error)
      return res.status(500).json({error: 'Internal server error'});
    }
  });

    // Add route to get conversation history
  app.get('/conversations/:conversationId', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT sender, content, created_at 
         FROM messages 
         WHERE conversation_id = $1 
         ORDER BY created_at ASC`,
        [req.params.conversationId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({error: 'Internal server error'});
    }
  });

  // Add route to list user's conversations
  app.get('/conversations', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, title, created_at 
         FROM conversations 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [req.user.userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({error: 'Internal server error'});
    }
  });

  // Delete conversation
  app.delete('/conversations/:conversationId', authenticateToken, async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    try {
      // verify that the conversation belongs to the user
      const convoCheck = await pool.query(
        `SELECT id FROM conversations WHERE id = $1 AND user_id = $2`,
        [conversationId, userId]
      );

      if (convoCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }

      // delete the conversation
      await agentManager.deleteConversation(conversationId);

      res.json({ message: 'Conversation deleted successfully.' });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  // Rename conversation
  app.put('/conversations/:conversationId', authenticateToken, async (req, res) => {
    const { conversationId } = req.params;
    const { title } = req.body;
    const userId = req.user.userId;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Valid title is required.' });
    }

    try {
      // verify that the conversation belongs to the user
      const convoCheck = await pool.query(
        `SELECT id FROM conversations WHERE id = $1 AND user_id = $2`,
        [conversationId, userId]
      );

      if (convoCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }

      // update the conversation title
      await pool.query(
        `UPDATE conversations SET title = $1 WHERE id = $2`,
        [title, conversationId]
      );

      res.json({ message: 'Conversation renamed successfully.', title });
    } catch (error) {
      console.error('Error renaming conversation:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  app.post('/messages', authenticateToken, async (req, res) => {
    const { conversationId, sender, text } = req.body;
  
    if (!conversationId || !sender || !text) {
      return res.status(400).json({ error: 'conversationId, sender, and text are required.' });
    }
  
    try {
      await agentManager.saveMessage(conversationId, sender, text);
      res.status(200).json({ message: 'Message saved successfully.' });
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to save message.' });
    }
  });
}

