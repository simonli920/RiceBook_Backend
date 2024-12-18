const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const { isLoggedIn } = require('../utils/middleware');

// Get following list
router.get('/:user?', isLoggedIn, async (req, res) => {
    try {
        const userId = req.params.user || req.session.userId;
        const profile = await Profile.findOne({ user: userId })
            .populate('following', 'username');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ following: profile.following });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching following list',
            error: error.message
        });
    }
});

// Add following
router.put('/:username', isLoggedIn, async (req, res) => {
    try {
        const userToFollow = await User.findOne({ username: req.params.username });

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.findOne({ user: req.session.userId });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Check if already following
        if (profile.following.includes(userToFollow._id)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Add to following list
        profile.following.push(userToFollow._id);
        await profile.save();

        const updatedProfile = await Profile.findOne({ user: req.session.userId })
            .populate('following', 'username');

        res.json({ following: updatedProfile.following });
    } catch (error) {
        res.status(500).json({
            message: 'Error adding following',
            error: error.message
        });
    }
});

// Remove following
router.delete('/:username', isLoggedIn, async (req, res) => {
    try {
        const userToUnfollow = await User.findOne({ username: req.params.username });

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.findOne({ user: req.session.userId });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Check if actually following
        if (!profile.following.includes(userToUnfollow._id)) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        // Remove from following list
        profile.following = profile.following.filter(
            id => id && id.toString() !== userToUnfollow._id.toString()
        );
        await profile.save();

        const updatedProfile = await Profile.findOne({ user: req.session.userId })
            .populate('following', 'username');

        res.json({ following: updatedProfile.following });
    } catch (error) {
        res.status(500).json({
            message: 'Error removing following',
            error: error.message
        });
    }
});

module.exports = router;
