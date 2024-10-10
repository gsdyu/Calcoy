const fs = require('fs');
const path = require('path');
const express = require('express');
const { authenticateToken } = require('../authMiddleware');
const multer = require('multer');

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

module.exports = (app, pool) => {
  // Route to fetch user profile
  app.get('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
      const result = await pool.query('SELECT username, email, profile_image, dark_mode FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      res.json({
        username: user.username,
        email: user.email,
        profile_image: user.profile_image,
        dark_mode: user.dark_mode,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to update the username
  app.put('/api/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { username } = req.body;

    try {
      await pool.query('UPDATE users SET username = $1 WHERE id = $2', [username, userId]);
      res.json({ message: 'Username updated successfully' });
    } catch (error) {
      console.error('Error updating username:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to upload profile picture
  app.put('/api/profile-picture', authenticateToken, upload.single('profile_image'), async (req, res) => {
    const userId = req.user.userId;
    const profileImagePath = req.file.path;

    try {
      await pool.query('UPDATE users SET profile_image = $1 WHERE id = $2', [profileImagePath, userId]);
      res.json({ message: 'Profile picture updated', profile_image: profileImagePath });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
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

  // Serve uploaded profile pictures statically
  app.use('/uploads', express.static('uploads'));
};