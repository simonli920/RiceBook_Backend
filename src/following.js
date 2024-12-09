// src/following.js

module.exports = (app, { User, Profile }, { sessionUser, cookieKey }) => {
    const isLoggedIn = require('./auth.js').isLoggedIn;

    app.get('/following/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.username;
        const profile = await Profile.findOne({ username });
        res.json({ following: profile.following || [] });
    });

    app.put('/following/:user', isLoggedIn, async (req, res) => {
        const userToFollow = req.params.user;
        await Profile.findOneAndUpdate(
            { username: req.username },
            { $addToSet: { following: userToFollow } }
        );
        const profile = await Profile.findOne({ username: req.username });
        res.json({ following: profile.following });
    });

    app.delete('/following/:user', isLoggedIn, async (req, res) => {
        const userToUnfollow = req.params.user;
        await Profile.findOneAndUpdate(
            { username: req.username },
            { $pull: { following: userToUnfollow } }
        );
        const profile = await Profile.findOne({ username: req.username });
        res.json({ following: profile.following });
    });
};