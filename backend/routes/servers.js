const express = require('express');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const { authenticateToken } = require('../authMiddleware');
const upload = multer({ dest: 'uploads/' });
const { v4: uuidv4 } = require('uuid');
module.exports = (app, pool, io) => {
  app.get('/api/user', authenticateToken, async (req, res) => {
    const userId = req.user.userId;  
    if (userId) {
      res.json({ userId });
    } else {
      res.status(401).json({ error: 'User not authenticated' });
    }
  });
  app.get('/api/servers/:serverId', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
  
    try {
      const { rows } = await pool.query(
        'SELECT id, name, image_url, created_by, invite_link FROM servers WHERE id = $1',
        [serverId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Server not found' });
      }
  
      res.json(rows[0]); // Send the server details
    } catch (error) {
      console.error('Error fetching server details:', error);
      res.status(500).json({ error: 'Error fetching server details' });
    }
  });

  app.get('/api/servers/:serverId/users', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
  
    try {
      const { rows } = await pool.query(
       `SELECT users.username, users.email, users.id FROM "userServers" 
        INNER JOIN users ON "userServers".user_id = users.id
        WHERE "userServers".server_id = $1`, [serverId]
      );
      if (rows.rowCount === 0) {
        return res.status(404).json({error: "Server not found or there are no users."});
      }
      
      return(res.json(rows))
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json( { error: 'Internal Server Error'})
    }
  })
  
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
      io.emit('serverLeft', {serverId:serverId, userId:userId})

      res.json({ message: 'Successfully left the server' });
    } catch (err) {
      console.error('Error leaving server:', err);
      res.status(500).json({ error: 'Error leaving server' });
    }
  });
 
  app.post('/api/servers/join', authenticateToken, upload.none(), async (req, res) => {
    const { inviteLink } = req.body;
    const userId = req.user.userId;
  
    try {
      if (!inviteLink || typeof inviteLink !== 'string') {
        return res.status(400).json({ error: 'Invalid invite link format' });
      }
  
      const inviteIdentifier = inviteLink.split('/').pop();
  
      const serverResult = await pool.query('SELECT id FROM servers WHERE invite_link = $1', [inviteIdentifier]);
  
      if (serverResult.rowCount === 0) {
        return res.status(404).json({ error: 'Invalid invite link' });
      }
  
      const serverId = serverResult.rows[0].id;
  
      const userServerCheck = await pool.query(
        'SELECT 1 FROM "userServers" WHERE user_id = $1 AND server_id = $2',
        [userId, serverId]
      );
  
      if (userServerCheck.rowCount > 0) {
        return res.status(200).json({ message: 'Already joined' });
      }
  
      await pool.query('INSERT INTO "userServers" (user_id, server_id) VALUES ($1, $2)', [userId, serverId]);

      let { rows } = await pool.query(`SELECT username, email FROM users
                                         WHERE users.id=$1`, [userId]);
      rows.push({serverId: serverId})
      io.emit('userJoined', rows);

      res.status(201).json({ message: 'Successfully joined the server', serverId });
    } catch (error) {
      console.error('Error joining server:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  app.post('/api/servers/create', authenticateToken, upload.single('icon'), async (req, res) => {
    const { serverName } = req.body;
    const userId = req.user.userId;
    const icon = req.file;
  
    try {
      const iconPath = icon ? `/uploads/${icon.filename}` : null;
      const inviteLink = uuidv4(); // Generate a unique invite link
  
      const { rows } = await pool.query(
        `INSERT INTO servers (name, image_url, created_by, invite_link) VALUES ($1, $2, $3, $4) RETURNING *`,
        [serverName, iconPath, userId, inviteLink]
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
