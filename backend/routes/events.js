const { authenticateToken } = require('../authMiddleware');

module.exports = (app, pool) => {

  // Create event route
  app.post('/events', authenticateToken, async (req, res) => {
    const { title, description, start_time, end_time, location, frequency, calendar, time_zone } = req.body;
    const userId = req.user.userId;

    // Convert start_time and end_time to Date objects
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    // Check if end time is after start time
    if (endDate <= startDate) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO events (user_id, title, description, start_time, end_time, location, frequency, calendar, time_zone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [userId, title, description, startDate.toISOString(), endDate.toISOString(), location, frequency, calendar, time_zone]
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

  // Delete event route
  app.delete('/events/:eventId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.eventId;

    try {
      // First, check if the event belongs to the authenticated user
      const checkResult = await pool.query('SELECT * FROM events WHERE id = $1 AND user_id = $2', [eventId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found or you do not have permission to delete this event' });
      }

      // If the event exists and belongs to the user, delete it
      const deleteResult = await pool.query('DELETE FROM events WHERE id = $1', [eventId]);
      
      if (deleteResult.rowCount > 0) {
        res.json({ message: 'Event deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete the event' });
      }
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};