// src/following.js

module.exports = (app, models, session) => {
    const { isLoggedIn } = require('./authMiddleware')(session.sessionUser, session.cookieKey);
    const { Profile } = models;

    const getFollowing = async (req, res) => {
        const username = req.params.user ? req.params.user : req.username;
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send('Profile not found');
        res.status(200).send({ username: profile.username, following: profile.following });
    };

    const addFollowing = async (req, res) => {
        const userToFollow = req.params.user;

        if (!userToFollow) {
            return res.status(400).send('Missing user to follow');
        }

        // Check if the user exists
        const userExists = await Profile.findOne({ username: userToFollow });
        if (!userExists) {
            return res.status(404).send('User to follow not found');
        }

        await Profile.updateOne(
            { username: req.username },
            { $addToSet: { following: userToFollow } }
        );
        const profile = await Profile.findOne({ username: req.username });
        res.status(200).send({ username: req.username, following: profile.following });
    };

    const removeFollowing = async (req, res) => {
        const userToUnfollow = req.params.user;

        if (!userToUnfollow) {
            return res.status(400).send('Missing user to unfollow');
        }

        await Profile.updateOne(
            { username: req.username },
            { $pull: { following: userToUnfollow } }
        );
        const profile = await Profile.findOne({ username: req.username });
        res.status(200).send({ username: req.username, following: profile.following });
    };

    app.get('/following/:user?', isLoggedIn, getFollowing);
    app.put('/following/:user', isLoggedIn, addFollowing);
    app.delete('/following/:user', isLoggedIn, removeFollowing);
};