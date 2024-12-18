require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:3000',
    credentials: true
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to RiceBook API',
        endpoints: {
            auth: '/auth',
            articles: '/articles',
            profiles: '/profiles',
            following: '/following'
        }
    });
});
// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/articles', require('./routes/articleRoutes'));
app.use('/profiles', require('./routes/profileRoutes'));
app.use('/following', require('./routes/followingRoutes'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 