const Profile = require('../models/Profile');

// 获取关注列表
exports.getFollowing = async (req, res) => {
    try {
        const targetUser = req.params.user || req.username;
        const profile = await Profile.findOne({ username: targetUser });
        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ username: targetUser, following: profile.following });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 添加关注
exports.addFollowing = async (req, res) => {
    try {
        const userToFollow = req.params.user;
        const username = req.username;

        if (userToFollow === username) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        // 检查要关注的用户是否存在
        const targetProfile = await Profile.findOne({ username: userToFollow });
        if (!targetProfile) {
            return res.status(404).json({ message: 'User to follow does not exist' });
        }

        const currentProfile = await Profile.findOne({ username });
        if (!currentProfile.following.includes(userToFollow)) {
            currentProfile.following.push(userToFollow);
            await currentProfile.save();
        }

        res.json({ username, following: currentProfile.following });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 取消关注
exports.removeFollowing = async (req, res) => {
    try {
        const userToUnfollow = req.params.user;
        const username = req.username;

        const currentProfile = await Profile.findOne({ username });
        if (currentProfile.following.includes(userToUnfollow)) {
            currentProfile.following = currentProfile.following.filter(user => user !== userToUnfollow);
            await currentProfile.save();
        } else {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        res.json({ username, following: currentProfile.following });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}; 