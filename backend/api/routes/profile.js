const express = require('express');
const { authenticateToken } = require('../authMiddleware');
const { put } = require('@vercel/blob');
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

  const { v4: uuidv4 } = require('uuid');
  const { put } = require('@vercel/blob');
  
  app.put('/profile/picture', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { imageBase64 } = req.body; // Expecting Base64 string of the image
  
    console.log("Request Body:", req.body); // Debugging the request payload
  
    try {
      let imageUrl = null;
  
      // Check if Base64 image data is provided
      if (imageBase64) {
        // Generate a unique filename for the profile image
        const fileName = `profile-images/${uuidv4()}.png`;
  
        // Convert Base64 string to binary buffer
        const buffer = Buffer.from(imageBase64, 'base64');
  
        // Upload the image to Vercel Blob
        const blob = await put(fileName, buffer, { access: 'public' });
  
        // Ensure the blob upload was successful
        if (!blob || !blob.url) {
          throw new Error('Failed to upload image to Vercel Blob');
        }
  
        imageUrl = blob.url; // Public URL for the uploaded image
        console.log("Uploaded Image URL:", imageUrl);
      } else {
        return res.status(400).json({ error: 'No image provided' });
      }
  
      // Store the image URL in the database
      const result = await pool.query(
        'UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING profile_image',
        [imageUrl, userId]
      );
  
      const updatedProfileImage = result.rows[0]?.profile_image;
  
      if (!updatedProfileImage) {
        throw new Error('Failed to update profile image in the database');
      }
  
      res.json({
        message: 'Profile picture updated successfully!',
        profile_image: updatedProfileImage,
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
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

  app.get('/api/users/search', async (req, res) => {
    const { query } = req.query;
    try {
      const result = await pool.query(
        `SELECT id, username FROM users WHERE username ILIKE $1 LIMIT 10`,
        [`%${query}%`]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: 'Failed to search users' });
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
  app.post('/api/friend-request', authenticateToken, async (req, res) => {
    const { receiverUsername } = req.body;
    const senderId = req.user.userId; // Extract userId from the token
  
    try {
      // Check if the receiver exists
      const receiverResult = await pool.query('SELECT id FROM users WHERE username = $1', [receiverUsername]);
      if (receiverResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      const receiverId = receiverResult.rows[0].id;
  
      // Check if a friend request already exists in either direction
      const existingRequest = await pool.query(
        `SELECT id FROM friend_requests 
         WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1))
           AND status IN ('pending', 'accepted')`,
        [senderId, receiverId]
      );
  
      if (existingRequest.rows.length > 0) {
        return res.status(400).json({ message: 'Friend request already exists' });
      }
  
      // Insert the new friend request if no existing request was found
      await pool.query(
        `INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, 'pending')`,
        [senderId, receiverId]
      );
  
      res.json({ message: 'Friend request sent' });
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ message: 'Failed to send friend request' });
    }
  });
  
  app.get('/api/friend-income', authenticateToken, async (req, res) => {
    const userId = req.user.userId;  
  
    try {
      const result = await pool.query(
        `SELECT fr.id, u.username AS sender 
         FROM friend_requests fr 
         JOIN users u ON fr.sender_id = u.id 
         WHERE fr.receiver_id = $1 AND fr.status = 'pending'`,
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      res.status(500).json({ message: 'Failed to fetch friend requests' });
    }
  });
  
  app.post('/api/friend-request/accept', authenticateToken, async (req, res) => {
    const { requestId } = req.body;
  
    try {
      await pool.query(
        `UPDATE friend_requests SET status = 'accepted' WHERE id = $1`,
        [requestId]
      );
      res.json({ message: 'Friend request accepted' });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      res.status(500).json({ message: 'Failed to accept friend request' });
    }
  });
  

  app.post('/api/friend-request/decline', authenticateToken, async (req, res) => {
    const { requestId } = req.body;
  
    try {
      await pool.query(
        `UPDATE friend_requests SET status = 'declined' WHERE id = $1`,
        [requestId]
      );
      res.json({ message: 'Friend request declined' });
    } catch (error) {
      console.error('Error declining friend request:', error);
      res.status(500).json({ message: 'Failed to decline friend request' });
    }
  });  
  
  app.get('/api/friends', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
  
    try {
      const result = await pool.query(
        `SELECT u.id, u.username AS name
         FROM users u
         JOIN friend_requests fr ON (fr.sender_id = u.id OR fr.receiver_id = u.id)
         WHERE (fr.sender_id = $1 OR fr.receiver_id = $1) 
           AND fr.status = 'accepted' 
           AND u.id != $1`,
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ message: 'Failed to fetch friends' });
    }
  });
  app.delete('/api/friends/:friendId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;  
    const friendId = parseInt(req.params.friendId, 10);  
  
    try {
    
      await pool.query(
        `DELETE FROM friend_requests 
         WHERE (sender_id = $1 AND receiver_id = $2) 
            OR (sender_id = $2 AND receiver_id = $1)`,
        [userId, friendId]
      );
      
      res.json({ message: 'Friend removed successfully' });
    } catch (error) {
      console.error('Error removing friend:', error);
      res.status(500).json({ message: 'Failed to remove friend' });
    }
  });
  app.get('/api/friends/:friendId/events', authenticateToken, async (req, res) => {
    const friendId = parseInt(req.params.friendId, 10);
    const userId = req.user.userId;
  
    try {
      // Check if the users are friends
      const friendCheck = await pool.query(
        `SELECT * FROM friend_requests 
         WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)) 
           AND status = 'accepted'`,
        [userId, friendId]
      );
  
      if (friendCheck.rows.length === 0) {
        console.error('Access denied: Not friends');
        return res.status(403).json({ message: 'Access denied: Not friends' });
      }
  
       const events = await pool.query(
        `SELECT * FROM events 
         WHERE user_id = $1 AND server_id IS NULL
         ORDER BY start_time`,
        [friendId]
      );
  
      res.json(events.rows);
    } catch (error) {
      console.error('Error fetching friend events:', error);
      res.status(500).json({ message: 'Failed to fetch friend events' });
    }
  });

app.get('/api/user/theme', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT dark_mode FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ dark_mode: result.rows[0].dark_mode });
  } catch (error) {
    console.error('Error fetching theme preference:', error);
    res.status(500).json({ message: 'Failed to fetch theme preference' });
  }
});

 app.put('/api/user/theme', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { dark_mode } = req.body;

  try {
    await pool.query(
      `UPDATE users SET dark_mode = $1 WHERE id = $2`,
      [dark_mode, userId]
    );
    res.json({ message: 'Theme preference updated successfully' });
  } catch (error) {
    console.error('Error updating theme preference:', error);
    res.status(500).json({ message: 'Failed to update theme preference' });
  }
});


  
};

