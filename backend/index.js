const { app, pool } = require('./server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
            if (error.constraint === 'users_username_key') { // Check for username conflict
                console.error('Duplicate username:', username);
                return res.status(400).json({ error: 'Username already taken' });
            }
        }
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ token });
        } else {
            res.status(400).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
