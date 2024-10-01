const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = (pool) => {
  // Google OAuth Strategy configuration
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        const username = profile.displayName;

        try {
          // Check if user already exists
          let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

          if (user.rows.length === 0) {
            // Create new user if not found
            const newUser = await pool.query(
              'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
              [username, email]
            );
            user = newUser;
          }

          // Proceed with user data
          done(null, user.rows[0]);
        } catch (error) {
          console.error('Google signup error:', error);
          done(error, null);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, user.rows[0]);
    } catch (error) {
      done(error, null);
    }
  });
};
