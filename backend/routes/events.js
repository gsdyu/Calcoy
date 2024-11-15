const { authenticateToken } = require('../authMiddleware');
const { createEmbeddings } = require('../ai/embeddings');

module.exports = (app, pool, io) => {
  // Create event route
  app.post('/events', authenticateToken, async (req, res) => {
    const { title, description, start_time, end_time, location, frequency, calendar, time_zone, completed, server_id } = req.body;
    const userId = req.user.userId;

    const serverId = server_id !== undefined && server_id !== null ? parseInt(server_id) : null;
    const includeInPersonal = serverId !== null;  

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (endDate < startDate) {
      return res.status(400).json({ error: 'End time cannot be before start time' });
    }

    try {
      let embed = '';
      try {
        embed = await createEmbeddings(JSON.stringify(req.body));
      } catch {
        console.error('Embed error: failed to create embedding for event');
      }

      const result = await pool.query(
        `INSERT INTO events (user_id, title, description, start_time, end_time, location, frequency, calendar, time_zone, server_id, include_in_personal) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING *`,
        [userId, title, description, startDate.toISOString(), endDate.toISOString(), location, frequency, calendar, time_zone, serverId, includeInPersonal]
      );

      if (embed) {
        await pool.query(`
          UPDATE events
          SET embedding = $1
          WHERE id = $2
        `, [JSON.stringify(embed[0]), result.rows[0].id]);
      }

      // Debug log before emitting event
      console.log("Emitting 'eventCreated' WebSocket event for event ID:", result.rows[0].id);

      // Emit WebSocket event only if event creation is successful
      io.emit('eventCreated', result.rows[0]);

      res.status(201).json({
        message: 'Event created successfully',
        event: result.rows[0],
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

   
  // Get events route
  app.get('/events', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const server_id = req.query.server_id ? parseInt(req.query.server_id) : null;

    try {
      const userServers = await pool.query(
        'SELECT server_id FROM "userServers" WHERE user_id = $1',
        [userId]
      );
      const accessibleServerIds = userServers.rows.map(row => row.server_id);

      if (server_id && !accessibleServerIds.includes(server_id)) {
        return res.status(403).json({ error: 'Access to this server is denied' });
      }

      const query = server_id !== null 
        ? `SELECT * FROM events WHERE (server_id = $1 OR (include_in_personal = TRUE AND server_id IS NULL)) ORDER BY start_time`
        : `SELECT * FROM events WHERE (server_id IS NULL OR include_in_personal = TRUE) AND user_id = $1 ORDER BY start_time`;

      const result = await pool.query(query, server_id !== null ? [server_id] : [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Import events route
  app.post('/events/import', authenticateToken, async (req, res) => {
    const { server_id, displayOption } = req.body;
    const userId = req.user.userId;

    try {
      const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
      const username = userResult.rows[0]?.username || 'User';

      let query, events;

      if (displayOption === 'full') {
        query = `SELECT * FROM events WHERE user_id = $1 AND server_id IS NULL`;
        events = await pool.query(query, [userId]);
      } else if (displayOption === 'limited') {
        query = `SELECT id, user_id, start_time, end_time FROM events WHERE user_id = $1 AND server_id IS NULL`;
        events = await pool.query(query, [userId]);
      } else {
        return res.status(400).json({ error: 'Invalid display option' });
      }

      const importedEvents = await Promise.all(events.rows.map(async (event) => {
        const title = displayOption === 'full' ? event.title : username;
        const description = displayOption === 'full' ? event.description : null;
        const location = displayOption === 'full' ? event.location : null;

        const insertQuery = displayOption === 'full'
          ? `INSERT INTO events (user_id, title, description, start_time, end_time, location, frequency, calendar, time_zone, completed, server_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`
          : `INSERT INTO events (user_id, title, start_time, end_time, server_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`;

        const params = displayOption === 'full'
          ? [event.user_id, title, description, event.start_time, event.end_time, location, event.frequency, event.calendar, event.time_zone, event.completed, server_id]
          : [event.user_id, title, event.start_time, event.end_time, server_id];

        const importedEvent = await pool.query(insertQuery, params);
        return importedEvent.rows[0];
      }));

      // Emit the imported events to WebSocket clients
      io.emit('eventsImported', importedEvents);

      res.status(200).json({ message: 'Events imported successfully', importedCount: importedEvents.length });
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
        // Emit the updated event to WebSocket clients
        io.emit('eventUpdated', updateResult.rows[0]);
        
        res.json({ message: 'Event updated successfully', event: updateResult.rows[0] });
      } else {
        res.status(500).json({ error: 'Failed to update the event' });
      }
    } catch (error) {
      console.error('Update event error:', error);
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
        // Emit the deleted event ID to WebSocket clients
        io.emit('eventDeleted', { eventId });

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
