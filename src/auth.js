// src/auth.js

const bcrypt = require('bcrypt');
const { sessionUser, cookieKey } = require('./authMiddleware');
const User = require('./models/User');
const Profile = require('./models/Profile');

const saltRounds = 10;

const register = async (req, res) => {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    // Hash password
    const hash = await bcrypt.hash(password, saltRounds);

    // Create user and profile
    const newUser = new User({ username, hash });
    const newProfile = new Profile({
        username,
        headline: 'Hello, this is my profile!',
        email: '',
        zipcode: '',
        phone: '',
        dob: new Date(),
        avatar: '',
        following: [],
    });

    await newUser.save();
    await newProfile.save();

    res.status(200).send({ username });
};

const login = async (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send('User not found');

    // Check password
    const match = await bcrypt.compare(password, user.hash);
    if (!match) return res.status(401).send('Invalid password');

    // Create session
    const sessionId = Math.random().toString(36).substring(2);
    sessionUser[sessionId] = user;

    // Set cookie
    res.cookie(cookieKey, sessionId, {
        maxAge: 3600 * 1000,
        httpOnly: true,
        sameSite: 'None',
        secure: true,
    });

    res.status(200).send({ username });
};

const logout = (req, res) => {
    const sid = req.cookies[cookieKey];
    delete sessionUser[sid];
    res.clearCookie(cookieKey);
    res.status(200).send('Logged out');
};

module.exports = (app) => {
    app.post('/register', register);
    app.post('/login', login);
    app.put('/logout', logout);
};
