const express = require('express');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const { authenticateToken } = require('../authMiddleware');
const upload = multer({ dest: 'uploads/' });

module.exports = (app, pool) => {
  app.get('/api/user', authenticateToken, async (req, res) => {
    const userId = req.user.userId; // Retrieve userId directly from the token
    if (userId) {
      res.json({ userId });
    } else {
      res.status(401).json({ error: 'User not authenticated' });
    }
  });
    // Route to leave a server
    app.delete('/api/servers/:serverId/leave', authenticateToken, async (req, res) => {
      const userId = req.user.userId;
      const { serverId } = req.params;
  
      try {
        // Delete the association between the user and the server
        const result = await pool.query(
          `DELETE FROM "userServers" WHERE user_id = $1 AND server_id = $2 RETURNING *`,
          [userId, serverId]
        );
  
        if (result.rowCount === 0) {
          return res.status(404).json({ error: 'Server not found or user not a member' });
        }
  
        res.json({ message: 'Successfully left the server' });
      } catch (err) {
        console.error('Error leaving server:', err);
        res.status(500).json({ error: 'Error leaving server' });
      }
    });
  
  // Route to create a new server
  app.post('/api/servers/create', authenticateToken, upload.single('icon'), async (req, res) => {
    const { serverName } = req.body;
    const userId = req.user.userId;
    const icon = req.file;

    try {
      const iconPath = icon ? `/uploads/${icon.filename}` : null;

      const { rows } = await pool.query(
        `INSERT INTO servers (name, image_url, created_by) VALUES ($1, $2, $3) RETURNING *`,
        [serverName, iconPath, userId]
      );

      const server = rows[0];

      await pool.query(
        `INSERT INTO "userServers" (user_id, server_id) VALUES ($1, $2)`,
        [userId, server.id]
      );

      res.json({ server });
    } catch (err) {
      console.error('Error creating server:', err);
      res.status(500).json({ error: 'Error creating server' });
    }
  });

  // Route to get all servers for a user
  app.get('/api/servers', authenticateToken, async (req, res) => {
    const userId = req.user.userId;// Retrieve userId from token

    try {
      const { rows } = await pool.query(
        `SELECT servers.* FROM servers
         JOIN "userServers" ON servers.id = "userServers".server_id
         WHERE "userServers".user_id = $1`, 
        [userId]
      );

      res.json({ servers: rows });
    } catch (err) {
      console.error('Error fetching servers:', err);
      res.status(500).json({ error: 'Error fetching servers' });
    }
  });
};
