const express = require('express');
const { authenticateToken } = require('../authMiddleware');

module.exports = (app, pool) => {
  // Route to fetch user profile
  app.get('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
      const result = await pool.query(
        'SELECT username, email, profile_image, dark_mode, preferences FROM users WHERE id = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      // Provide default preferences if they don't exist
      const preferences = user.preferences || { visibility: {}, colors: {} };

      res.json({
        username: user.username,
        email: user.email,
        profile_image: user.profile_image,
        dark_mode: user.dark_mode,
        preferences, // Return default preferences if undefined
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to update preferences
  app.put('/profile/preferences', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { preferences } = req.body;

    try {
      await pool.query('UPDATE users SET preferences = $1 WHERE id = $2', [preferences, userId]);
      res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to update the username
  app.put('/profile/name', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { username } = req.body;

    try {
      // Check that username is not taken
      const result = await pool.query('SELECT username FROM users WHERE username = $1 AND id != $2', [username, userId]);
      if (result.rows.length > 0) {
        return res.status(409).json({ error: `Username ${username} already taken.` });
      }

      // Update username
      await pool.query('UPDATE users SET username = $1 WHERE id = $2', [username, userId]);
      res.json({ message: 'Username updated successfully' });
    } catch (error) {
      console.error('Error updating username:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to update dark mode preference
  app.put('/profile/dark-mode', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { darkMode } = req.body;

    try {
      await pool.query('UPDATE users SET dark_mode = $1 WHERE id = $2', [darkMode, userId]);
      res.json({ message: 'Dark mode preference updated successfully' });
    } catch (error) {
      console.error('Error updating dark mode preference:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
