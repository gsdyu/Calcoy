import { Pool } from 'pg';
require('dotenv').config({ path: '../../../.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default async (req, res) => {
  if (req.method === 'POST') {
    const { username, email } = req.body;

    try {
      // Check if the username is already taken
      const usernameCheck = await pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username]
      );

      if (usernameCheck.rows.length > 0) {
        // Username is already taken
        return res.status(400).json({ error: 'Username is already taken' });
      }

      // Update the user with the provided username
      await pool.query(
        `UPDATE users SET username = $1 WHERE email = $2`,
        [username, email]
      );

      return res.status(200).json({ message: 'Username set successfully' });
    } catch (error) {
      console.error('Error setting username:', error);
      return res.status(500).json({ error: 'Error setting username' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};
