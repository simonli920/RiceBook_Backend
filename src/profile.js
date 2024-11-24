// src/profile.js

module.exports = (app, models, session) => {
    const { isLoggedIn } = require('./authMiddleware')(session.sessionUser, session.cookieKey);
    const { Profile } = models;

    const getHeadline = async (req, res) => {
        const username = req.params.user ? req.params.user : req.username;
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send('Profile not found');
        res.status(200).send({ username: profile.username, headline: profile.headline });
    };

    const updateHeadline = async (req, res) => {
        const { headline } = req.body;
        if (!headline) return res.status(400).send('Missing headline');
        const profile = await Profile.findOneAndUpdate(
            { username: req.username },
            { headline },
            { new: true }
        );
        res.status(200).send({ username: profile.username, headline: profile.headline });
    };

    const getEmail = async (req, res) => {
        const username = req.params.user ? req.params.user : req.username;
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send('Profile not found');
        res.status(200).send({ username: profile.username, email: profile.email });
    };

    const updateEmail = async (req, res) => {
        const { email } = req.body;
        if (!email) return res.status(400).send('Missing email');
        const profile = await Profile.findOneAndUpdate(
            { username: req.username },
            { email },
            { new: true }
        );
        res.status(200).send({ username: profile.username, email: profile.email });
    };

    const getZipcode = async (req, res) => {
        const username = req.params.user ? req.params.user : req.username;
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send('Profile not found');
        res.status(200).send({ username: profile.username, zipcode: profile.zipcode });
    };

    const updateZipcode = async (req, res) => {
        const { zipcode } = req.body;
        if (!zipcode) return res.status(400).send('Missing zipcode');
        const profile = await Profile.findOneAndUpdate(
            { username: req.username },
            { zipcode },
            { new: true }
        );
        res.status(200).send({ username: profile.username, zipcode: profile.zipcode });
    };

    const getPhone = async (req, res) => {
        const username = req.params.user ? req.params.user : req.username;
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send('Profile not found');
        res.status(200).send({ username: profile.username, phone: profile.phone });
    };

    const updatePhone = async (req, res) => {
        const { phone } = req.body;
        if (!phone) return res.status(400).send('Missing phone');
        const profile = await Profile.findOneAndUpdate(
            { username: req.username },
            { phone },
            { new: true }
        );
        res.status(200).send({ username: profile.username, phone: profile.phone });
    };

    const getDob = async (req, res) => {
        const username = req.params.user ? req.params.user : req.username;
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send('Profile not found');
        res.status(200).send({ username: profile.username, dob: profile.dob.getTime() });
    };

    const getAvatar = async (req, res) => {
        const username = req.params.user ? req.params.user : req.username;
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send('Profile not found');
        res.status(200).send({ username: profile.username, avatar: profile.avatar });
    };

    const updateAvatar = async (req, res) => {
        const { avatar } = req.body;
        if (!avatar) return res.status(400).send('Missing avatar');
        const profile = await Profile.findOneAndUpdate(
            { username: req.username },
            { avatar },
            { new: true }
        );
        res.status(200).send({ username: profile.username, avatar: profile.avatar });
    };

    app.get('/headline/:user?', isLoggedIn, getHeadline);
    app.put('/headline', isLoggedIn, updateHeadline);

    app.get('/email/:user?', isLoggedIn, getEmail);
    app.put('/email', isLoggedIn, updateEmail);

    app.get('/zipcode/:user?', isLoggedIn, getZipcode);
    app.put('/zipcode', isLoggedIn, updateZipcode);

    app.get('/phone/:user?', isLoggedIn, getPhone);
    app.put('/phone', isLoggedIn, updatePhone);

    app.get('/dob/:user?', isLoggedIn, getDob);

    app.get('/avatar/:user?', isLoggedIn, getAvatar);
    app.put('/avatar', isLoggedIn, updateAvatar);
};