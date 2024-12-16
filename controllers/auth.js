const bcrypt = require('bcrypt');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { cookieKey } = require('../utils/middleware');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send('User does not exist');
        }

        const valid = await bcrypt.compare(password, user.hash);
        if (!valid) {
            return res.status(401).send('Incorrect password');
        }

        // Set session
        req.session.user = {
            username: user.username,
            _id: user._id
        };

        res.cookie(cookieKey, req.sessionID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({
            username,
            result: 'success'
        });
    } catch (err) {
        res.status(500).json({ error: `Login failed: ${err.message}` });
    }
};

exports.register = async (req, res) => {
    const { username, password, email, dob, phone, zipcode } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = new User({ username, hash });
        await user.save();

        const profile = new Profile({
            username,
            email: email || '',
            dob: dob ? new Date(dob) : new Date(),
            phone: phone || '',
            zipcode: zipcode || '',
            avatar: '',
            following: []
        });
        await profile.save();

        // Set session after registration
        req.session.user = {
            username: user.username,
            _id: user._id
        };

        res.cookie(cookieKey, req.sessionID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            username,
            result: 'success'
        });
    } catch (err) {
        res.status(500).json({ error: `Registration failed: ${err.message}` });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out');
        }
        res.clearCookie(cookieKey);
        res.status(200).send('Logged out successfully');
    });
};

exports.updatePassword = async (req, res) => {
    const { password } = req.body;
    const username = req.session.user.username;

    if (!password) {
        return res.status(400).send('Password cannot be empty');
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await User.updateOne({ username }, { hash });
        res.status(200).send('Password updated successfully');
    } catch (err) {
        res.status(500).send(`Failed to update password: ${err.message}`);
    }
};

