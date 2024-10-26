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

        try {
          // Check if user already exists
          let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          let user = userResult.rows[0];

          if (!user) {
            // Create a new user without a password and without a username
            const newUserResult = await pool.query(
              'INSERT INTO users (email) VALUES ($1) RETURNING *',
              [email]
            );
            user = newUserResult.rows[0];
          }

          // Proceed with user data
          return done(null, user);
        } catch (error) {
          console.error('Google signup error:', error);
          return done(error, null);
        }
      }
    )
  );
  passport.use('google-calendar', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/calendar/callback',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    accessType: 'offline',
    prompt: 'consent',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Access Token:", accessToken);
      console.log("Profile:", profile);
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if (!email) return done(new Error("No email found in profile"));
    
      let user = await findOrCreateUser(email, pool);
      return done(null, { accessToken, user });
    } catch (error) {
      console.error('Detailed OAuth Error:', error);
      return done(error, null);
    }
  }));
  
  
  
  
  

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, userResult.rows[0]);
    } catch (error) {
      done(error, null);
    }
  });
};
