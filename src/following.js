// src/following.js

const Profile = require('./models/Profile');
const { isLoggedIn } = require('./authMiddleware');

const getFollowing = async (req, res) => {
    const profile = await Profile.findOne({ username: req.username });
    res.status(200).send({ username: req.username, following: profile.following });
};

const addFollowing = async (req, res) => {
    const userToFollow = req.params.user;
    await Profile.updateOne(
        { username: req.username },
        { $addToSet: { following: userToFollow } }
    );
    const profile = await Profile.findOne({ username: req.username });
    res.status(200).send({ username: req.username, following: profile.following });
};

const removeFollowing = async (req, res) => {
    const userToUnfollow = req.params.user;
    await Profile.updateOne(
        { username: req.username },
        { $pull: { following: userToUnfollow } }
    );
    const profile = await Profile.findOne({ username: req.username });
    res.status(200).send({ username: req.username, following: profile.following });
};

module.exports = (app) => {
    app.get('/following/:user?', isLoggedIn, getFollowing);
    app.put('/following/:user', isLoggedIn, addFollowing);
    app.delete('/following/:user', isLoggedIn, removeFollowing);
};
