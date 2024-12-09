// src/profile.js

module.exports = (app, { User, Profile }, { sessionUser, cookieKey }) => {
    const isLoggedIn = require('./auth.js').isLoggedIn;

    // Email endpoints
    app.get('/email/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.username;
        const profile = await Profile.findOne({ username });
        if (!profile) {
            return res.status(404).send('用户不存在');
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
            return res.status(404).send('用户不存在');
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

    app.put('/avatar', isLoggedIn, async (req, res) => {
        const { avatar } = req.body;
        await Profile.findOneAndUpdate({ username: req.username }, { avatar });
        res.json({ avatar });
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
                return res.status(404).send('用户不存在');
            }
            
            res.json({ username, headline: profile.headline || '' });
        } catch (err) {
            res.status(500).send(`获取 headline 失败: ${err.message}`);
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
            res.status(500).send(`更新 headline 失败: ${err.message}`);
        }
    });
};