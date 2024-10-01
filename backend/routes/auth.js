const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // To send 2FA code via email

module.exports = (app, pool) => {

    // Configure nodemailer for sending 2FA code via email
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can replace this with any email service provider you're using
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Use EMAIL_PASS here instead of EMAIL_PASSWORD
        },
    });

    // Signup route
    app.post('/auth/signup', async (req, res) => {
        const { username, email, password } = req.body;

        // Check if password contains spaces
        if (/\s/.test(password)) {
            return res.status(400).json({ error: 'Password should not contain spaces' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
                [username, email, hashedPassword]
            );

            console.log('User created successfully');
            res.status(201).json({ message: 'User created', user: result.rows[0] });
        } catch (error) {
            if (error.code === '23505') { // Unique constraint violation
                if (error.constraint === 'users_email_key') {
                    console.error('Duplicate email:', email);
                    return res.status(400).json({ error: 'Email already exists' });
                }
                if (error.constraint === 'users_username_key') {  
                    console.error('Duplicate username:', username);
                    return res.status(400).json({ error: 'Username already taken' });
                }
            }
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Login route (Step 1)
    app.post('/auth/login', async (req, res) => {
        const { email, password } = req.body;
        try {
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
                return res.json({ token });
            } else {
                return res.status(401).json({ error: 'Invalid or expired 2FA code' });
            }
        } catch (error) {
            console.error('2FA verification error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
};
