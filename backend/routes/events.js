const { authenticateToken } = require('../authMiddleware');

module.exports = (app, pool) => {

  // Create event route
  app.post('/events', authenticateToken, async (req, res) => {
    const { title, description, start_time, end_time, location, frequency, calendar } = req.body;
    const userId = req.user.userId;

    try {
      const result = await pool.query(
        'INSERT INTO events (user_id, title, description, start_time, end_time, location, frequency, calendar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [userId, title, description, start_time, end_time, location, frequency, calendar]
      );
      res.status(201).json({ message: 'Event created', event: result.rows[0] });
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Event time overlaps with an existing event' });
      }
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get events route
  app.get('/events', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
      const result = await pool.query('SELECT * FROM events WHERE user_id = $1 ORDER BY start_time', [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
