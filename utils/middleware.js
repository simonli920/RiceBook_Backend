const cookieKey = 'sid';

const isLoggedIn = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized - Please login first' });
    }
    next();
};

module.exports = { isLoggedIn, cookieKey }; 