const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const msal = require('@azure/msal-node');
const session = require('express-session');
const passport = require('passport');
const ICAL = require('ical.js');

const { authenticateToken } = require('../authMiddleware');

module.exports = (app, pool) => {
  // Configure session middleware
  app.use(
    session({
      secret: 'your-session-secret', // Replace with a strong secret
      resave: false,
      saveUninitialized: true,
    })
  );

  // MSAL configuration for Microsoft OAuth
  const msalConfig = {
    auth: {
      clientId: process.env.MICROSOFT_ID,
      authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
      clientSecret: process.env.MICROSOFT_SECRET,
    },
    system: {
      loggerOptions: {
        loggerCallback(loglevel, message, containsPii) {
         },
        piiLoggingEnabled: false,
        logLevel: msal.LogLevel.Info,
      },
    },
  };
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,  
    },
});

  const pca = new msal.ConfidentialClientApplication(msalConfig);

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Google Auth Route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
 
// Google Auth Callback Route
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }),
  async (req, res) => {
    const email = req.user.email;
    try {
      let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user = userResult.rows[0];

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Store the token in the session or cookies
      req.session.token = token;
      res.cookie('auth_token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.node_env === 'production',
        path: '/',
      });

      // Redirect to the username page if the user has no username set
      if (!user.username) {
        req.session.tempUser = { email }; // Save email in session for username setup
        return res.redirect('http://localhost:3000/auth/username');
      }

      // Otherwise, redirect to the calendar page
      res.redirect('http://localhost:3000/calendar');
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).send('Internal server error');
    }
  }
)
;

// Google Auth Route for Importing Calendar Events
app.get('/auth/google/calendar', authenticateToken, passport.authenticate('google-calendar', {
  scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
}),
async (req, res) => {console.log("User authenticated:", req.user);}
);

// Google Auth Callback Route for Importing Calendar Events
app.get('/auth/google/calendar/callback', passport.authenticate('google-calendar', { failureRedirect: '/auth/login', session: false }),
async (req, res) => {
  try {
      const accessToken = req.user.accessToken; 
    
    
    res.redirect(`http://localhost:3000/calendar?token=${accessToken}`);
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Internal server error');
  }
});
app.post('/auth/proxy-fetch', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Retrieve userId directly from the token
  const { url } = req.body;

  console.log("Received proxy-fetch request for user:", userId, "with URL:", url); // Debug log

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Fetch the calendar data from the provided URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch data from the provided URL');
    }

    const data = await response.text();
    const jcalData = ICAL.parse(data);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');

    const events = vevents.map(event => {
      const vEvent = new ICAL.Event(event);
      return {
        title: vEvent.summary || 'No Title',
        description: vEvent.description || '',
        start_time: vEvent.startDate.toJSDate(),
        end_time: vEvent.endDate.toJSDate(),
        location: vEvent.location || '',
        calendar: 'canvas',
        time_zone: vEvent.startDate.zone.tzid || 'UTC',
      };
    });

    // Insert events into the database
    const insertPromises = events.map(event =>
      pool.query(
        `INSERT INTO events (user_id, title, description, start_time, end_time, location, calendar, time_zone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [
          userId, // Directly use userId from the token
          event.title,
          event.description,
          event.start_time,
          event.end_time,
          event.location,
          event.calendar,
          event.time_zone,
        ]
      )
    );

    await Promise.all(insertPromises);
    res.status(200).json({ message: 'Events imported successfully' });

  } catch (error) {
    console.error('Error in proxy fetch:', error);
    res.status(500).json({ error: 'Error fetching data from the URL' });
  }
});

  // Azure AD Authentication route
  app.get('/auth/azure', (req, res) => {
    const cryptoProvider = new msal.CryptoProvider();

    cryptoProvider
      .generatePkceCodes()
      .then(({ verifier, challenge }) => {
        req.session.codeVerifier = verifier;

        const authCodeUrlParameters = {
          scopes: ['openid', 'profile', 'email'],
          redirectUri: 'http://localhost:5000/auth/azure/callback',
          codeChallenge: challenge,
          codeChallengeMethod: 'S256',
        };

        pca
          .getAuthCodeUrl(authCodeUrlParameters)
          .then((response) => {
            res.redirect(response);
          })
          .catch((error) => {
            console.error('AuthCodeUrl Error:', error);
            res.status(500).send('Error generating auth code URL');
          });
      })
      .catch((error) => {
        console.error('PKCE Code Generation Error:', error);
        res.status(500).send('Error generating PKCE codes');
      });
  });

  // Azure AD Authentication callback route
  app.get('/auth/azure/callback', (req, res) => {
    const tokenRequest = {
      code: req.query.code,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: 'http://localhost:5000/auth/azure/callback',
      codeVerifier: req.session.codeVerifier,
    };

    pca
      .acquireTokenByCode(tokenRequest)
      .then(async (response) => {
        const idTokenClaims = response.idTokenClaims;
        const email = idTokenClaims.preferred_username || idTokenClaims.email;

        try {
          let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          let user = userResult.rows[0];

          // If user does not exist, create the user without a username
          if (!user) {
            const newUserResult = await pool.query(
              'INSERT INTO users (email) VALUES ($1) RETURNING *',
              [email]
            );
            user = newUserResult.rows[0];
          }

          // Create JWT token for your application
          const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

          // Store the token in the session or cookies
          res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/',
          });

          // Redirect to the username page if the user is new and has no username set
          if (!user.username) {
            req.session.tempUser = { email }; // Save email in session for username setup
            return res.redirect('http://localhost:3000/auth/username');
          }

          // Otherwise, redirect to the calendar page
          res.redirect('http://localhost:3000/calendar');
        } catch (error) {
          console.error('Azure login error:', error);
          res.status(500).send('Internal server error');
        }
      })
      .catch((error) => {
        console.error('Token Acquisition Error:', error);
        res.status(500).send('Authentication failed');
      });
  });

  // Route to handle setting the username for first-time login users
// Route to handle setting the username for first-time login users
app.post('/auth/set-username', async (req, res) => {
    const { username } = req.body;
    const { email } = req.session.tempUser;  // Get email stored in session
  
    try {
      const result = await pool.query(
        'UPDATE users SET username = $1 WHERE email = $2 RETURNING *',
        [username, email]
      );
  
      // Clear the tempUser session
      req.session.tempUser = null;
  
      // Send the updated user data
      res.json({ user: result.rows[0] });
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'users_username_key') {
        // Handle unique constraint violation (duplicate username)
        return res.status(400).json({ error: 'Username already taken' });
      }
      console.error('Error setting username:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  


  // Signup route
  const bcrypt = require('bcryptjs'); // For password hashing
  const jwt = require('jsonwebtoken');
  
 // Signup route
 app.post('/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      // Check if the user already exists
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user into the database
      const newUser = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [username, email, hashedPassword]
      );

      // Create a JWT token
      const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Send the response
      res.cookie('auth_token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.node_env === 'production',
        path:'/',
      });
      res.status(201).json({ message: 'User created successfully', user: newUser.rows[0]});
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
    // Login route (Step 1)
    app.post('/auth/login', async (req, res) => {
        const { email, password } = req.body;

        try {
            // Check if the user exists
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (user && await bcrypt.compare(password, user.password)) {
                // Step 2: Generate 6-digit 2FA code
                const twoFactorCode = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit code

                // Set expiration time for 2FA code (e.g., 10 minutes)
                const twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);

                // Save the 2FA code and its expiration time in the database
                await pool.query(
                    'UPDATE users SET two_factor_code = $1, two_factor_expires = $2 WHERE email = $3',
                    [twoFactorCode, twoFactorExpires, email]
                );

                // Send the 2FA code to the user's email
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'Your Two-Factor Authentication Code',
                    text: `Your 2FA code is: ${twoFactorCode}. It will expire in 10 minutes.`,
                });

                // Inform the frontend that 2FA is required
                return res.json({ message: '2FA_REQUIRED' });
            } else {
                return res.status(400).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
    app.post('/auth/forgot-password', async (req, res) => {
        const { email } = req.body;
    
        try {
          // Check if the user exists
          const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          const user = result.rows[0];
    
          if (!user) {
            return res.status(400).json({ error: 'No account with that email exists.' });
          }
    
          // Generate a 6-digit code
          const resetCode = Math.floor(100000 + Math.random() * 900000);
    
          // Set expiration time for the reset code (10 minutes)
          const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    
          // Save the reset code and expiration in the database
          await pool.query(
            'UPDATE users SET two_factor_code = $1, two_factor_expires = $2 WHERE email = $3',
            [resetCode, resetCodeExpires, email]
          );
    
          // Send the code to the user's email
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Password Reset Code',
            text: `Your password reset code is: ${resetCode}. It will expire in 10 minutes.`,
          });
    
          res.status(200).json({ message: 'Reset code sent to your email.' });
        } catch (error) {
          console.error('Forgot password error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    
      // Route to verify the code and reset the password
      app.post('/auth/reset-password', async (req, res) => {
        const { email, resetCode, newPassword, confirmPassword } = req.body;
    
        try {
          if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
          }
    
          // Fetch user by email
          const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          const user = result.rows[0];
    
          const now = new Date();
          // Check if the code is valid and not expired
          if (user && user.two_factor_code === resetCode && user.two_factor_expires > now) {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
    
            // Update the user's password and clear the reset code
            await pool.query(
              'UPDATE users SET password = $1, two_factor_code = NULL, two_factor_expires = NULL WHERE email = $2',
              [hashedPassword, email]
            );
    
            res.status(200).json({ message: 'Password has been updated successfully.' });
          } else {
            return res.status(401).json({ error: 'Invalid or expired reset code.' });
          }
        } catch (error) {
          console.error('Reset password error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    
    // Verify 2FA code route (Step 2)
    app.post('/auth/verify-2fa', async (req, res) => {
        const { email, twoFactorCode } = req.body;

        try {
            // Fetch user by email
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            const now = new Date();
            // Check if the code is valid and not expired
            if (user && user.two_factor_code === twoFactorCode && user.two_factor_expires > now) {
                // Clear the 2FA code and expiration from the database after successful login
                await pool.query('UPDATE users SET two_factor_code = NULL, two_factor_expires = NULL WHERE email = $1', [email]);

                // Generate JWT token
                const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

                // Return the JWT token to the client
                res.cookie('auth_token', token, {
                  httpOnly: true,
                  sameSite: 'strict',
                  secure: process.env.node_env === 'production',
                  path:'/',
                });
              return res.status(200).json({message: 'Success'});
            } else {
                return res.status(401).json({ error: 'Invalid or expired 2FA code' });
            }
        } catch (error) {
            console.error('2FA verification error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });


   app.post('/auth/logout', (req, res) => {
     res.clearCookie("auth_token", {path: '/'});
     return res.status(200).json({message: "Log out successful"});
   });
  
  app.get('/auth/check', authenticateToken, (req, res) => {
    return res.status(200).json({isLoggedIn: "True"});
  });
};
