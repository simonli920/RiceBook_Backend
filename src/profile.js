// src/profile.js

module.exports = (app, { User, Profile }, { sessionUser, cookieKey }) => {
    const isLoggedIn = require('./auth.js').isLoggedIn;
    const { upload } = require('./multer.js');

    // Email endpoints
    app.get('/email/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.username;
        const profile = await Profile.findOne({ username });
        if (!profile) {
            return res.status(404).send('User not found');
        }
        res.json({ username, email: profile.email || '' });
    });

    app.put('/email', isLoggedIn, async (req, res) => {
        const { email } = req.body;
        await Profile.findOneAndUpdate(
            { username: req.username },
            { email }
        );
        res.json({ email });
    });

    // Phone endpoints
    app.get('/phone/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.username;
        const profile = await Profile.findOne({ username });
        if (!profile) {
            return res.status(404).send('User not found');
        }
        res.json({ username, phone: profile.phone || '' });
    });

    app.put('/phone', isLoggedIn, async (req, res) => {
        const { phone } = req.body;
        await Profile.findOneAndUpdate(
            { username: req.username },
            { phone }
        );
        res.json({ phone });
    });

    // Zipcode endpoints
    app.get('/zipcode/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.username;
        const profile = await Profile.findOne({ username });
        res.json({ zipcode: profile.zipcode });
    });

    app.put('/zipcode', isLoggedIn, async (req, res) => {
        const { zipcode } = req.body;
        await Profile.findOneAndUpdate({ username: req.username }, { zipcode });
        res.json({ zipcode });
    });

    // Avatar endpoints
    app.get('/avatar/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.username;
        const profile = await Profile.findOne({ username });
        res.json({ avatar: profile.avatar || '' });
    });

    app.put('/avatar', isLoggedIn, upload.single('avatar'), async (req, res) => {
        try {
            const avatarUrl = req.file.path;
            await Profile.findOneAndUpdate({ username: req.username }, { avatar: avatarUrl });
            res.json({ username: req.username, avatar: avatarUrl });
        } catch (err) {
            res.status(500).send(`Failed to update avatar: ${err.message}`);
        }
    });

    // DOB endpoint
    app.get('/dob', isLoggedIn, async (req, res) => {
        const profile = await Profile.findOne({ username: req.username });
        res.json({ dob: profile.dob.getTime() });
    });

    // Headline endpoints
    app.get('/headline/:user?', isLoggedIn, async (req, res) => {
        try {
            const username = req.params.user || req.username;
            const profile = await Profile.findOne({ username });
            
            if (!profile) {
                return res.status(404).send('User not found');
            }
            
            res.json({ username, headline: profile.headline || '' });
        } catch (err) {
            res.status(500).send(`Failed to get headline: ${err.message}`);
        }
    });

    app.put('/headline', isLoggedIn, async (req, res) => {
        try {
            const { headline } = req.body;
            
            const profile = await Profile.findOneAndUpdate(
                { username: req.username },
                { headline },
                { new: true, upsert: true }
            );
            
            res.json({ username: req.username, headline: profile.headline });
        } catch (err) {
            res.status(500).send(`Failed to update headline: ${err.message}`);
        }
    });
};