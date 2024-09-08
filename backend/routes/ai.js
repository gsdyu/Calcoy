//const { authenticateToken } = require('../authMiddleware');

module.exports = (app, pool) => {

  // Create event route
  app.get('/ai', authenticateToken, async (req, res) => {
	  res.send({"status": "ready"});
  });
}
