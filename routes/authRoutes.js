const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { isLoggedIn } = require('../utils/middleware');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, dob } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username or email already exists' 
            });
        }

        // Create new user
        const user = new User({
            username,
            password,
            email
        });
        await user.save();

        // Create associated profile
        const profile = new Profile({
            user: user._id,
            username: username,
            email,
            dob: new Date(dob),
            headline: `Welcome ${username}!`,
            avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${username}`
        });
        await profile.save();

        // Set session
        req.session.userId = user._id;

        res.status(201).json({
            message: 'Registration successful',
            username: user.username
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error during registration',
            error: error.message 
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid username or password' 
            });
        }

        // Validate password
        const isValid = await user.validatePassword(password);
        if (!isValid) {
            return res.status(401).json({ 
                message: 'Invalid username or password' 
            });
        }

        // Set session
        req.session.userId = user._id;

        res.json({
            message: 'Login successful',
            username: user.username
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error during login',
            error: error.message 
        });
    }
});

// Logout
router.put('/logout', isLoggedIn, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                message: 'Error during logout' 
            });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
    });
});

// Update password
router.put('/password', isLoggedIn, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.session.userId);

        // Validate old password
        const isValid = await user.validatePassword(oldPassword);
        if (!isValid) {
            return res.status(401).json({ 
                message: 'Current password is incorrect' 
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating password',
            error: error.message 
        });
    }
});

module.exports = router;
