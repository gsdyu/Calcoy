const { authenticateToken } = require('../authMiddleware');
const { createEmbeddings } = require('../ai/embeddings');

module.exports = (app, pool) => {
  // Create event route
  app.post('/events', authenticateToken, async (req, res) => {
    const { title, description, start_time, end_time, location, frequency, calendar, time_zone, completed, server_id } = req.body;
    const userId = req.user.userId;

    const serverId = server_id !== undefined && server_id !== null ? parseInt(server_id) : null;

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (endDate < startDate) {
      return res.status(400).json({ error: 'End time cannot be before start time' });
    }

    try {
      const embed = await createEmbeddings(JSON.stringify(req.body));
      const result = await pool.query(
        `INSERT INTO events (user_id, title, description, start_time, end_time, location, frequency, calendar, time_zone, completed, server_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [userId, title, description, startDate.toISOString(), endDate.toISOString(), location, frequency, calendar, time_zone, completed || false, serverId]
      );
      res.status(201).json({ message: 'Event created', event: result.rows[0] });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get events route
// Get events route (with optional server_id filter)
app.get('/events', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const server_id = req.query.server_id ? parseInt(req.query.server_id) : null;

  try {
    const query = server_id !== null 
      ? `SELECT * FROM events WHERE user_id = $1 AND server_id = $2 ORDER BY start_time`
      : `SELECT * FROM events WHERE user_id = $1 AND server_id IS NULL ORDER BY start_time`;
    
    const result = await pool.query(query, server_id !== null ? [userId, server_id] : [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/events/import', authenticateToken, async (req, res) => {
  const { server_id, displayOption } = req.body;
  const userId = req.user.userId;

  try {
    let query, events;

    if (displayOption === 'full') {
      // Import all details from null calendar events
      query = `SELECT * FROM events WHERE user_id = $1 AND server_id IS NULL`;
      events = await pool.query(query, [userId]);
    } else if (displayOption === 'limited') {
      // Import only specific fields from null calendar events
      query = `SELECT id, user_id, start_time, end_time FROM events WHERE user_id = $1 AND server_id IS NULL`;
      events = await pool.query(query, [userId]);
    } else {
      return res.status(400).json({ error: 'Invalid display option' });
    }

    const importedEvents = await Promise.all(events.rows.map(async (event) => {
      // Check if the event already exists in the target server based on the unique constraint
      const existingEventQuery = `
        SELECT 1 FROM events 
        WHERE user_id = $1 AND title = $2 AND start_time = $3 AND end_time = $4 
        AND COALESCE(location, '') = COALESCE($5, '') AND server_id = $6
      `;
      const existingEvent = await pool.query(existingEventQuery, [
        event.user_id,
        event.title || '', // Handle null titles
        event.start_time,
        event.end_time,
        event.location || '', // Handle null locations
        server_id,
      ]);

      if (existingEvent.rows.length > 0) {
        console.log(`Skipping duplicate event: ${event.title} on ${event.start_time}`);
        return null; // Skip duplicate
      }

      // Insert the event based on the display option
      const insertQuery = displayOption === 'full'
        ? `INSERT INTO events (user_id, title, description, start_time, end_time, location, frequency, calendar, time_zone, completed, server_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`
        : `INSERT INTO events (user_id, start_time, end_time, server_id)
           VALUES ($1, $2, $3, $4) RETURNING *`;

      const params = displayOption === 'full'
        ? [event.user_id, event.title, event.description, event.start_time, event.end_time, event.location, event.frequency, event.calendar, event.time_zone, event.completed, server_id]
        : [event.user_id, event.start_time, event.end_time, server_id];

      return pool.query(insertQuery, params);
    }));

    const results = importedEvents.filter(Boolean); // Filter out null results (skipped duplicates)
    res.status(200).json({ message: 'Events imported successfully', importedCount: results.length });
  } catch (error) {
    console.error('Event import error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  // Update event route
  app.put('/events/:eventId', authenticateToken, async (req, res) => {
    const { title, description, start_time, end_time, location, frequency, calendar, time_zone, completed, server_id } = req.body;
    const userId = req.user.userId;
    const eventId = req.params.eventId;

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (endDate < startDate) {
      return res.status(400).json({ error: 'End time must be before start time' });
    }

    try {
      const checkResult = await pool.query('SELECT * FROM events WHERE id = $1 AND user_id = $2', [eventId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found or you do not have permission to update this event' });
      }

      const updateResult = await pool.query(
        `UPDATE events 
         SET title = $1, description = $2, start_time = $3, end_time = $4, location = $5, frequency = $6, calendar = $7, time_zone = $8, completed = $9, server_id = $10 
         WHERE id = $11 RETURNING *`,
        [title, description, startDate.toISOString(), endDate.toISOString(), location, frequency, calendar, time_zone, completed || false, server_id || null, eventId]
      );
      
      if (updateResult.rowCount > 0) {
        res.json({ message: 'Event updated successfully', event: updateResult.rows[0] });
      } else {
        res.status(500).json({ error: 'Failed to update the event' });
      }
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update task completion status
  app.put('/events/:eventId/complete', authenticateToken, async (req, res) => {
    const { completed } = req.body;
    const userId = req.user.userId;
    const eventId = req.params.eventId;

    try {
      const checkResult = await pool.query('SELECT * FROM events WHERE id = $1 AND user_id = $2', [eventId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found or you do not have permission to update this task' });
      }

      const updateResult = await pool.query(
        'UPDATE events SET completed = $1 WHERE id = $2 RETURNING *',
        [completed, eventId]
      );
      
      if (updateResult.rowCount > 0) {
        res.json({ message: 'Task completion status updated successfully', event: updateResult.rows[0] });
      } else {
        res.status(500).json({ error: 'Failed to update task completion status' });
      }
    } catch (error) {
      console.error('Update task completion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete event route
  app.delete('/events/:eventId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.eventId;

    try {
      const checkResult = await pool.query('SELECT * FROM events WHERE id = $1 AND user_id = $2', [eventId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found or you do not have permission to delete this event' });
      }

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