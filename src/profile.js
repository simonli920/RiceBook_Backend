// src/profile.js

const Profile = require('./models/Profile');
const { isLoggedIn } = require('./authMiddleware');

const getHeadline = async (req, res) => {
    const username = req.params.user ? req.params.user : req.username;
    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(404).send('Profile not found');
    res.status(200).send({ username: profile.username, headline: profile.headline });
};

const updateHeadline = async (req, res) => {
    const { headline } = req.body;
    const profile = await Profile.findOneAndUpdate(
        { username: req.username },
        { headline },
        { new: true }
    );
    res.status(200).send({ username: profile.username, headline: profile.headline });
};

module.exports = (app) => {
    app.get('/headline/:user?', isLoggedIn, getHeadline);
    app.put('/headline', isLoggedIn, updateHeadline);
};
