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

module.exports = (app, pool, pusher) => {
  // Route to fetch user profile

  app.get('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
      const result = await pool.query(
        'SELECT username, email, profile_image, profile_image_x, profile_image_y, profile_image_scale, dark_mode, preferences FROM users WHERE id = $1', 
        [userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      const preferences = user.preferences || { visibility: {}, colors: {} };

      res.json({
        username: user.username,
        email: user.email,
        profile_image: user.profile_image,
        profile_image_x: user.profile_image_x || 0,
        profile_image_y: user.profile_image_y || 0,
        profile_image_scale: user.profile_image_scale || 1,
        dark_mode: user.dark_mode,
        preferences,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

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
	  //Check that username is not taken
      const result = await pool.query('SELECT username FROM users WHERE username = $1 AND id = $2', [username, userId])
      if (result.rows.username) {
        const error_unique = `Username ${username} already taken.`
        console.error(error_unique)
        res.status(409).json({error: error_unique})
        return;
      }
	  //Update username
      await pool.query('UPDATE users SET username = $1 WHERE id = $2', [username, userId]);
      return res.json({ message: 'Username updated successfully' });
    } catch (error) {
      console.error('Error updating username:', error);
      console.error(error.code)
      if (error.code == 23505) {return res.status(409).json({error:`Username ${username} already taken.`})}
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to upload profile picture
  app.put('/profile/picture', authenticateToken, upload.single('profile_image'), async (req, res) => {
    const userId = req.user.userId;
    const profileImagePath = req.file.path;
    
    // Get position and scale data from the request body
    const x_offset = parseFloat(req.body.x_offset) || 0;
    const y_offset = parseFloat(req.body.y_offset) || 0;
    const scale = parseFloat(req.body.scale) || 1;

    try {
      await pool.query(
        `UPDATE users 
         SET profile_image = $1,
             profile_image_x = $2,
             profile_image_y = $3,
             profile_image_scale = $4
         WHERE id = $5`,
        [profileImagePath, x_offset, y_offset, scale, userId]
      );
      
      res.json({ 
        message: 'Profile picture updated', 
        profile_image: profileImagePath,
        profile_image_x: x_offset,
        profile_image_y: y_offset,
        profile_image_scale: scale
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
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
      const result = await pool.query(
        `INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, 'pending') RETURNING *`,
        [senderId, receiverId]
      );

      
      pusher.trigger("friends-channel", "pendingRequest", {
        data: [{id: result.rows[0].id, sender: req.user.username}],
        senderId: req.user.userId,
        receiverId: receiverId,
      });
      
  
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

      const result = await pool.query(
      `SELECT u.id as "senderId", fr.id as "frId"
       FROM friend_requests fr
       JOIN users u ON fr.sender_id = u.id
       WHERE fr.id = $1`,
      [requestId]);

      pusher.trigger("friends-channel", "acceptRequest", {
        data: [{id: req.user.userId, name: req.user.username}],
        frId: result.rows[0].frId,
        senderId: result.rows[0].senderId,
      });
      
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

      const result = await pool.query(
      `SELECT u.id as "senderId", fr.id
       FROM friend_requests fr
       JOIN users u ON fr.sender_id = u.id
       WHERE fr.id = $1`,
      [requestId]);
      result.rows[0].receiverId = req.user.userId;

      pusher.trigger("friends-channel", "declineRequest", {
        data: [{id: result.rows[0].id, name: req.user.username}],
        receiverId: req.user.userId,
      });
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

      pusher.trigger("friends-channel", "deleteFriend", {
        data: [{id: userId, name: req.user.username}],
        receiverId: friendId,
      });
      
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
      // Verify friendship
      const friendCheck = await pool.query(
        `SELECT * FROM friend_requests 
         WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)) 
           AND status = 'accepted'`,
        [userId, friendId]
      );
  
      if (friendCheck.rows.length === 0) {
        return res.status(403).json({ message: 'Access denied: Not friends' });
      }
  
      // Fetch the friend's privacy setting
      const privacyResult = await pool.query('SELECT privacy, username FROM users WHERE id = $1', [friendId]);
      const { privacy, username } = privacyResult.rows[0] || { privacy: 'public', username: 'Unknown User' };
  
      let events = [];
      if (privacy === 'public') {
        const eventsQuery = `SELECT * FROM events WHERE user_id = $1 AND server_id IS NULL ORDER BY start_time`;
        const eventsResult = await pool.query(eventsQuery, [friendId]);
        events = eventsResult.rows;
      } else if (privacy === 'limited') {
        const eventsQuery = `SELECT start_time, end_time FROM events WHERE user_id = $1 AND server_id IS NULL ORDER BY start_time`;
        const eventsResult = await pool.query(eventsQuery, [friendId]);
        events = eventsResult.rows.map(event => ({
          username,
          start_time: event.start_time,
          end_time: event.end_time,
        }));
      } else {
        return res.status(200).json([]); // Private: No events visible
      }
  
      res.json(events);
    } catch (error) {
      console.error('Error fetching friend events:', error);
      res.status(500).json({ message: 'Failed to fetch friend events' });
    }
  });
  app.get('/api/user/privacy-settings', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
  
    try {
      const userResult = await pool.query('SELECT privacy FROM users WHERE id = $1', [userId]);
      const serverResult = await pool.query('SELECT server_id, privacy FROM server_privacy WHERE user_id = $1', [userId]);
      const serversResult = await pool.query('SELECT id, name FROM servers WHERE id IN (SELECT server_id FROM "userServers" WHERE user_id = $1)', [userId]);
  
      const serverPrivacy = serverResult.rows.reduce((acc, row) => {
        acc[row.server_id] = row.privacy;
        return acc;
      }, {});
  
      res.json({
        userId,
        defaultPrivacy: userResult.rows[0]?.privacy || 'public',
        serverPrivacy,
        servers: serversResult.rows,
      });
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      res.status(500).json({ error: 'Failed to fetch privacy settings' });
    }
  });
  app.put('/api/user/privacy-settings', authenticateToken, async (req, res) => {
    const { userId, privacy, serverId } = req.body;
  
    if (!['public', 'limited', 'private'].includes(privacy)) {
      return res.status(400).json({ error: 'Invalid privacy option' });
    }
  
    try {
      if (serverId) {
        await pool.query(
          `INSERT INTO server_privacy (user_id, server_id, privacy) VALUES ($1, $2, $3)
           ON CONFLICT (user_id, server_id) DO UPDATE SET privacy = $3`,
          [userId, serverId, privacy]
        );
      } else {
        await pool.query('UPDATE users SET privacy = $1 WHERE id = $2', [privacy, userId]);
      }
      res.json({ message: 'Privacy setting updated successfully' });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      res.status(500).json({ error: 'Failed to update privacy settings' });
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


  // Serve uploaded profile pictures statically  
  app.use('/uploads', express.static('uploads'));
};
