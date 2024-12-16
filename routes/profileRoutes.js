const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { isLoggedIn } = require('../utils/middleware');
const User = require('../models/User');

// Get headline
router.get('/headline/:username?', isLoggedIn, async (req, res) => {
    try {
        let query;
        if (req.params.username) {
            query = { username: req.params.username };
        } else {
            query = { user: req.session.userId };
        }

        const profile = await Profile.findOne(query);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ headline: profile.headline });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching headline',
            error: error.message
        });
    }
});

// Update headline
router.put('/headline', isLoggedIn, async (req, res) => {
    try {
        const { headline } = req.body;
        console.log('Session userId:', req.session.userId);
        console.log('New headline:', headline);

        const profile = await Profile.findOneAndUpdate(
            { user: req.session.userId },
            { $set: { headline } },
            { new: true }
        );
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ headline: profile.headline });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error updating headline',
            error: error.message
        });
    }
});

// Get email
router.get('/email/:username?', isLoggedIn, async (req, res) => {
    try {
        let query;
        if (req.params.username) {
            query = { username: req.params.username };
        } else {
            query = { user: req.session.userId };
        }

        const profile = await Profile.findOne(query);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ email: profile.email });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching email',
            error: error.message
        });
    }
});

// Update email
router.put('/email', isLoggedIn, async (req, res) => {
    try {
        const { email } = req.body;
        const profile = await Profile.findOneAndUpdate(
            { user: req.session.userId },
            { $set: { email } },
            { new: true }
        );
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ email: profile.email });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating email',
            error: error.message
        });
    }
});

// Get zipcode
router.get('/zipcode/:username?', isLoggedIn, async (req, res) => {
    try {
        let query;
        if (req.params.username) {
            query = { username: req.params.username };
        } else {
            query = { user: req.session.userId };
        }

        const profile = await Profile.findOne(query);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ zipcode: profile.zipcode });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching zipcode',
            error: error.message
        });
    }
});

// Update zipcode
router.put('/zipcode', isLoggedIn, async (req, res) => {
    try {
        const { zipcode } = req.body;
        const profile = await Profile.findOneAndUpdate(
            { user: req.session.userId },
            { $set: { zipcode } },
            { new: true }
        );
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ zipcode: profile.zipcode });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating zipcode',
            error: error.message
        });
    }
});

// Get phone
router.get('/phone/:username?', isLoggedIn, async (req, res) => {
    try {
        let query;
        if (req.params.username) {
            query = { username: req.params.username };
        } else {
            query = { user: req.session.userId };
        }

        const profile = await Profile.findOne(query);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ phone: profile.phone });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching phone',
            error: error.message
        });
    }
});

// Update phone
router.put('/phone', isLoggedIn, async (req, res) => {
    try {
        const { phone } = req.body;
        const profile = await Profile.findOneAndUpdate(
            { user: req.session.userId },
            { $set: { phone } },
            { new: true }
        );
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ phone: profile.phone });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating phone',
            error: error.message
        });
    }
});

// Get date of birth
router.get('/dob', isLoggedIn, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.session.userId });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ dob: profile.dob });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching date of birth',
            error: error.message
        });
    }
});

// Get avatar
router.get('/avatar/:username?', isLoggedIn, async (req, res) => {
    try {
        let query;
        if (req.params.username) {
            query = { username: req.params.username };
        } else {
            query = { user: req.session.userId };
        }

        const profile = await Profile.findOne(query);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ avatar: profile.avatar });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching avatar',
            error: error.message
        });
    }
});

// Update avatar
router.put('/avatar', isLoggedIn, async (req, res) => {
    try {
        const { avatar } = req.body;
        const profile = await Profile.findOneAndUpdate(
            { user: req.session.userId },
            { $set: { avatar } },
            { new: true }
        );
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ avatar: profile.avatar });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating avatar',
            error: error.message
        });
    }
});

// Get full profile
router.get('/:username?', isLoggedIn, async (req, res) => {
    try {
        const username = req.params.username;
        console.log('Requested username:', username);
        
        // 如果没有提供username，使用当前登录用户的username
        if (!username) {
            const user = await User.findById(req.session.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const profile = await Profile.findOne({ user: req.session.userId });
            return res.json(profile);
        }

        // 如果提供了username，查找对应的用户和个人资料
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.findOne({ user: user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// Follow a user
router.post('/:username/follow', isLoggedIn, async (req, res) => {
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

        profile.following.push(userToFollow._id);
        await profile.save();

        res.json({ message: 'Successfully followed user' });
    } catch (error) {
        res.status(500).json({
            message: 'Error following user',
            error: error.message
        });
    }
});

// Unfollow a user
router.delete('/:username/follow', isLoggedIn, async (req, res) => {
    try {
        const userToUnfollow = await User.findOne({ username: req.params.username });
        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.findOne({ user: req.session.userId });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        profile.following = profile.following.filter(id => !id.equals(userToUnfollow._id));
        await profile.save();

        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        res.status(500).json({
            message: 'Error unfollowing user',
            error: error.message
        });
    }
});

module.exports = router;
