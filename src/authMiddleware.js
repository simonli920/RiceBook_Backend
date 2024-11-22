// src/authMiddleware.js

const sessionUser = {}; // Session store
const cookieKey = 'sid'; // Session cookie key

const isLoggedIn = (req, res, next) => {
    const sid = req.cookies[cookieKey];
    if (!sid) {
        return res.status(401).send('Unauthorized: No session ID');
    }

    const user = sessionUser[sid];

    if (!user) {
        return res.status(401).send('Unauthorized: Invalid session ID');
    }

    req.username = user.username; // Attach username to request object
    next();
};

module.exports = { isLoggedIn, sessionUser, cookieKey };