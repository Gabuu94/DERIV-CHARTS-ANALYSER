const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

// Register a new user with provided email and password
router.post('/register', async (req, res) => {
  const { email, password } = req.body; // Accept email and password from the request

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the provided password
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' }); // Respond without sending password
  } catch (error) {
    res.status(400).json({ error: 'User registration failed.' });
  }
});

// Login route remains unchanged
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
