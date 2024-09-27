const { authenticateToken } = require('../authMiddleware');
const { inputChat, initChat } = require('../ai/chat');

module.exports = (app, pool) => {
  // Create event route
  app.post('/ai', async (req, res) => {
    try {
      const userInput = req.body.message;
      if (!userInput) {
          return res.status(400).send({ error: "Input is required." });
      }


      const response = await inputChat(userInput);
      res.send({ message: response });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while processing your request." });
    }
  });
}
