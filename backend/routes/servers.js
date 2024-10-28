const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL connection

// Create a new server (group)
router.post('/create', async (req, res) => {
  const { name, ownerId } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO servers (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, ownerId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server creation failed' });
  }
});

// Join a server (group)
router.post('/join', async (req, res) => {
  const { serverId, userId } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO memberships (server_id, user_id) VALUES ($1, $2) RETURNING *',
      [serverId, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to join server' });
  }
});

// Get all members of a server
router.get('/:serverId/members', async (req, res) => {
  const { serverId } = req.params;

  try {
    const result = await pool.query(
      'SELECT users.id, users.name, users.email FROM users ' +
      'JOIN memberships ON users.id = memberships.user_id ' +
      'WHERE memberships.server_id = $1',
      [serverId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving server members' });
  }
});

module.exports = router;
