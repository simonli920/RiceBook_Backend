const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { isLoggedIn } = require('../utils/middleware');
const Profile = require('../models/Profile');

// Upload single image
router.post('/image', isLoggedIn, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        res.json({
            message: 'Image uploaded successfully',
            imageUrl: req.file.path
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            message: 'Error uploading image',
            error: error.message
        });
    }
});

// Upload avatar image
router.post('/avatar', isLoggedIn, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No avatar image provided' });
        }

        // Update user's profile with new avatar URL
        const profile = await Profile.findOneAndUpdate(
            { user: req.session.userId },
            { $set: { avatar: req.file.path } },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({
            message: 'Avatar uploaded successfully',
            avatar: req.file.path
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({
            message: 'Error uploading avatar',
            error: error.message
        });
    }
});

module.exports = router; 