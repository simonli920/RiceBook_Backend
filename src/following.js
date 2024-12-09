// src/following.js

module.exports = (app, { Profile }, { sessionUser, cookieKey }) => {
    const isLoggedIn = require('./auth.js').isLoggedIn;

    // 获取关注列表
    app.get('/following/:user?', isLoggedIn, async (req, res) => {
        try {
            const username = req.params.user || req.username;
            const profile = await Profile.findOne({ username });
            if (!profile) {
                return res.status(404).send('User not found');
            }
            res.json({ username, following: profile.following || [] });
        } catch (err) {
            res.status(500).send(`Failed to get following list: ${err.message}`);
        }
    });

    // 添加关注
    app.put('/following/:user', isLoggedIn, async (req, res) => {
        try {
            const userToFollow = req.params.user;

            // 检查要关注的用户是否存在
            const targetProfile = await Profile.findOne({ username: userToFollow });
            if (!targetProfile) {
                return res.status(404).send('要关注的用户不存在');
            }

            // 更新当前用户的关注列表
            await Profile.findOneAndUpdate(
                { username: req.username },
                { $addToSet: { following: userToFollow } }
            );

            const updatedProfile = await Profile.findOne({ username: req.username });
            res.json({ username: req.username, following: updatedProfile.following });
        } catch (err) {
            res.status(500).send(`添加关注失败: ${err.message}`);
        }
    });

    // 取消关注
    app.delete('/following/:user', isLoggedIn, async (req, res) => {
        try {
            const userToUnfollow = req.params.user;

            await Profile.findOneAndUpdate(
                { username: req.username },
                { $pull: { following: userToUnfollow } }
            );

            const updatedProfile = await Profile.findOne({ username: req.username });
            res.json({ username: req.username, following: updatedProfile.following });
        } catch (err) {
            res.status(500).send(`Failed to unfollow: ${err.message}`);
        }
    });
};