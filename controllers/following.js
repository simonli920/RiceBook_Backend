const Profile = require('../models/Profile');
const User = require('../models/User');

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

        // 查找要关注的用户
        const targetUser = await User.findOne({ username: userToFollow });
        if (!targetUser) {
            return res.status(404).json({ message: 'User to follow does not exist' });
        }

        const currentProfile = await Profile.findOne({ username });
        if (!currentProfile.following.includes(targetUser._id)) {
            currentProfile.following.push(targetUser._id);
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

        // 查找要取消关注的用户
        const targetUser = await User.findOne({ username: userToUnfollow });
        if (!targetUser) {
            return res.status(404).json({ message: 'User to unfollow does not exist' });
        }

        const currentProfile = await Profile.findOne({ username });
        if (currentProfile.following.includes(targetUser._id)) {
            currentProfile.following = currentProfile.following.filter(
                id => id && id.toString() !== targetUser._id.toString()
            );
            await currentProfile.save();
        } else {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        res.json({ username, following: currentProfile.following });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}; 