require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Allow  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  
    credentials: true  
}));
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

  app.post('/auth/signup', async (req, res) => {
	console.log('Signup data received:', req.body);
	const { username, email, password } = req.body;
	try {
	  const hashedPassword = await bcrypt.hash(password, 10);
	  const user = new User({ username, email, password: hashedPassword });
	  await user.save();
	  console.log('User created successfully');
	  res.status(201).send('User created');
	} catch (error) {
	  console.error('Signup error:', error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(400).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
	
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
