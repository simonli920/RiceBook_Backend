// src/auth.js

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Session handling
const sessionUser = {}; // Session store
const cookieKey = 'sid'; // Session cookie key

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    hash: String, // Password hash
});

const User = mongoose.model('User', userSchema);

// Profile Schema and Model
const profileSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    headline: String,
    email: String,
    zipcode: String,
    phone: String,
    dob: Date,
    avatar: String,
    following: [String],
});

const Profile = mongoose.model('Profile', profileSchema);

// Article Schema and Model
const commentSchema = new mongoose.Schema({
    commentId: Number,
    author: String,
    text: String,
    date: Date,
});

const articleSchema = new mongoose.Schema({
    pid: Number,
    author: String,
    text: String,
    date: Date,
    comments: [commentSchema],
});

const Article = mongoose.model('Article', articleSchema);

// Export models and session variables
module.exports = {
    setupAuthRoutes: (app) => {
        const { isLoggedIn } = require('./authMiddleware')(sessionUser, cookieKey);

        const saltRounds = 10;

        const register = async (req, res) => {
            const { username, password, email, dob, phone, zipcode } = req.body;

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
                email,
                zipcode,
                phone,
                dob: new Date(dob),
                avatar: '',
                following: [],
            });

            await newUser.save();
            await newProfile.save();

            res.status(200).send({ result: 'success', username });
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
                maxAge: 3600 * 1000, // 1 hour
                httpOnly: true,
                sameSite: 'None',
                secure: true,
            });

            res.status(200).send({ username, result: 'success' });
        };

        const logout = (req, res) => {
            const sid = req.cookies[cookieKey];
            delete sessionUser[sid];
            res.clearCookie(cookieKey);
            res.status(200).send('OK');
        };

        const changePassword = async (req, res) => {
            const { password } = req.body;

            if (!password) {
                return res.status(400).send('Missing password');
            }

            // Find the user and update the password hash
            const user = await User.findOne({ username: req.username });
            if (!user) {
                return res.status(404).send('User not found');
            }

            const hash = await bcrypt.hash(password, saltRounds);
            user.hash = hash;
            await user.save();

            res.status(200).send({ username: req.username, result: 'success' });
        };

        app.post('/register', register);
        app.post('/login', login);
        app.put('/logout', isLoggedIn, logout);
        app.put('/password', isLoggedIn, changePassword);
    },
    User,
    Profile,
    Article,
    sessionUser,
    cookieKey,
};