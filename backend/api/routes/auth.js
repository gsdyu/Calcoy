const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const msal = require('@azure/msal-node');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const passport = require('passport');
const { createEmbeddings } = require('../ai/embeddings');
const ICAL = require('ical.js');
const ICALgen = require('ical-generator').default

const { authenticateToken } = require('../authMiddleware');

module.exports = (app, pool) => {
  // Configure expressSession middleware
  app.use(
    expressSession({
      store: new pgSession({
        pool: pool,
        tableName: "userSessions",
      }),
      secret: process.env.COOKIE_SECRET || 'secret key',
      resave: false,
      saveUninitialized: false, // Prevent creating empty sessions
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        sameSite: 'none', // Required for cross-origin cookies
        secure: true, // Ensure secure cookies in production
      },
    })
  );
  

  // MSAL configuration for Microsoft OAuth
  const msalConfig = {
    auth: {
      clientId: process.env.MICROSOFT_ID,
      authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
      clientSecret: process.env.MICROSOFT_SECRET, // Required for confidential client
    },
    system: {
      loggerOptions: {
        loggerCallback(loglevel, message, containsPii) {
          console.log(`[MSAL] ${loglevel}: ${message}`);
        },
        piiLoggingEnabled: false,
        logLevel: msal.LogLevel.Info,
      },
    },
  };
  
const pca = new msal.ConfidentialClientApplication(msalConfig);

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,  
  },
});

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());


// Google Auth Route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
 
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  async (req, res) => {
    const email = req.user.email;

    try {
      let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user = userResult.rows[0];

      if (!user.username) {
        // User exists but no username, use Google username
        const googleUsername = req.user.displayName; // Retrieved in the Google strategy
        await pool.query('UPDATE users SET username = $1 WHERE email = $2', [googleUsername, email]);
        user.username = googleUsername;
      }

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Store the token in the express session and cookies
      req.session.token = token;
      console.log('Session after setting token:', req.session);

      res.cookie('auth_token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
      });

      // Redirect to the calendar page
      res.redirect(`${process.env.CLIENT_URL}/calendar`);
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).send('Internal server error');
    }
  }
);



// Google Auth Route for Importing Calendar Events
app.get('/auth/google/calendar', authenticateToken, passport.authenticate('google-calendar', {
  scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
  accessType: 'offline',
  approvalPrompt: 'force',
}),
async (req, res) => {console.log("User authenticated:", req.user);}
);

// Google Auth Callback Route for Importing Calendar Events
app.get('/auth/google/calendar/callback', passport.authenticate('google-calendar', { failureRedirect: '/auth/login', session: false }),
async (req, res) => {
  try {
      const accessToken = req.user.accessToken; 
    
    
    res.redirect('https://www.calcoy.com/calendar');
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to export calendar events as ICS - Miles
app.get('/auth/calendar/export', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Get userId from the token

  try {
    // Fetch events from the database for the authenticated user
    const result = await pool.query('SELECT * FROM events WHERE user_id = $1', [userId]);
    const events = result.rows;

    // Create an ICS file ```javascript
    const cal = ICALgen({ name: 'My Calendar' });

    events.forEach(event => {
      cal.createEvent({
        start: event.start_time,
        end: event.end_time,
        summary: event.title,
        description: event.description,
        location: event.location,
        uid: event.id.toString(), // Unique ID for the event
      });
    });

    // Set the response type to application/ics

    res.set('Content-Type', 'text/calendar');
    res.set('Content-Disposition', `attachment; filename=calendar.ics`);

    // Send the ICS file as a response
    res.status(200).send(cal.toString())
  } catch (error) {
    console.error('Error exporting calendar:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== "csulb.instructure.com") return res.status(400).json({error: 'Only accepting csulb calendar canvas'})
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
      console.log(vEvent)
      return {
        title: vEvent.summary || 'No Title',
        description: vEvent.description || '',
        start_time: vEvent.startDate.toJSDate(),
        end_time: vEvent.startDate.toJSDate(),
        location: vEvent.location || '',
        calendar: 'Task',
        time_zone: vEvent.startDate.zone.tzid || 'UTC',
        imported_from: 'csulb'
      };
    });

    // Insert events into the database
    const insertPromises = events.map(event =>
      pool.query(
        `INSERT INTO events (user_id, title, description, start_time, end_time, location, calendar, time_zone, imported_from)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
          event.imported_from
        ]
    ).then(async result => {
       // checks for embedding on all events. can convert to function
       // using this rather than create events gain from callback as using callback as it may recreate embedding even if the event already exist
       // callback events will always be given even if our calendar already has it stored
       const row = result.rows;
       if (!row[0]) {
         console.log('Import: Event already added')
         return};
       try {
         const embed = await createEmbeddings(JSON.stringify(row)
         ).then(embed_result => {
           if (embed_result === null || embed_result === undefined) { 
             console.error(`Error: No embeddings were created. Possibly out of tokens.`);
             return
           }
           pool.query(`UPDATE events
                       SET embedding = $6
                       WHERE user_id=$1 AND title=$2 AND location=$3 AND start_time=$4 AND end_time=$5;`, 
                       [row[0].user_id, row[0].title, row[0].location, row[0].start_time.toISOString(), row[0].end_time.toISOString(), JSON.stringify(embed_result)]);  
         }) 
       } catch (error) {
           if (error.status===402) {
             console.log("Error: Out of tokens")
           }
         }
    })
    );

    await Promise.all(insertPromises);
    res.status(200).json({ message: 'Events imported successfully' });

  } catch (error) {
    console.error('Error in proxy fetch:', error);
    res.status(500).json({ error: 'Error fetching data from the URL' });
  }
});
app.get('/auth/azure', (req, res) => {
  const cryptoProvider = new msal.CryptoProvider();

  cryptoProvider
    .generatePkceCodes()
    .then(({ verifier, challenge }) => {
      req.session.codeVerifier = verifier; // Store the codeVerifier in session

      const authCodeUrlParameters = {
        scopes: ['openid', 'profile', 'email'],
        redirectUri: 'https://backend-three-puce-56.vercel.app/auth/azure/callback', // Fully qualified URI
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
      };

      console.log('Auth Code URL Params:', authCodeUrlParameters); // Debugging

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
app.get('/auth/azure/callback', (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: 'https://backend-three-puce-56.vercel.app/auth/azure/callback',
    codeVerifier: req.session.codeVerifier, // Retrieve codeVerifier from session
  };

  pca
    .acquireTokenByCode(tokenRequest)
    .then(async (response) => {
      const idTokenClaims = response.idTokenClaims;
      const email = idTokenClaims?.preferred_username || idTokenClaims?.email;
      const microsoftUsername = idTokenClaims?.name; // Retrieve the username from Microsoft claims

      if (!email) {
        return res.status(400).send('Email not found in ID token claims');
      }

      try {
        // Check if the user exists in the database
        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (!user) {
          // User doesn't exist, insert into the database
          const newUserResult = await pool.query(
            'INSERT INTO users (email, username) VALUES ($1, $2) RETURNING *',
            [email, microsoftUsername]
          );
          user = newUserResult.rows[0];
        } else if (!user.username) {
          // Update existing user with the Microsoft username if not already set
          await pool.query('UPDATE users SET username = $1 WHERE email = $2', [microsoftUsername, email]);
          user.username = microsoftUsername;
        }

        // Create JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Set the token in cookies
        res.cookie('auth_token', token, {
          httpOnly: true,
          sameSite: 'none',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        });

        // Redirect directly to the calendar page
        res.redirect(`${process.env.CLIENT_URL}/calendar`);
      } catch (error) {
        console.error('Database error:', error);
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
  console.log('Session data:', req.session);

  if (!req.session.tempUser) {
    return res.status(400).json({ error: 'Session expired or invalid' });
  }

  const { email } = req.session.tempUser;

  try {
    const result = await pool.query(
      'UPDATE users SET username = $1 WHERE email = $2 RETURNING *',
      [req.body.username, email]
    );

    req.session.tempUser = null; // Clear session after use
    res.json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'users_username_key') {
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
        sameSite: 'none',
        secure: true, 
       
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
                  sameSite: 'none',
                  secure: true, 
                 
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

    app.post('/auth/contact', async (req, res) => {
      const { name, email, subject, message } = req.body;
    
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
    
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail', 
          auth: {
            user: process.env.EMAIL_USER_contact,  
            pass: process.env.EMAIL_PASS_contact,  
          },
        });
    
        const mailOptions = {
          from: `"${name}" <${email}>`, 
          to: process.env.EMAIL_USER_contact,  
          subject: `Contact Form: ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        };
    
       
        await transporter.sendMail(mailOptions);
    
        res.status(200).json({ message: 'Message sent successfully.' });
      } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send the message. Please try again later.' });
      }
    });

   app.post('/auth/logout', (req, res) => {
     res.clearCookie("auth_token", {path: '/'});
     return res.status(200).json({message: "Log out successful"});
   });
  
  app.get('/auth/check', authenticateToken, (req, res) => {
    
    return res.status(200).json({isLoggedIn: "True", userId: req.user.userId});
  });
};
