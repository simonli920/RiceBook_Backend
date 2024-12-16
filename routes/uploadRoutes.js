const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const { isLoggedIn } = require('../utils/middleware');
const Profile = require('../models/Profile');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Only image files are allowed!'), false);
            return;
        }
        cb(null, true);
    }
});

// Handle upload errors
const handleUploadError = (error, req, res, next) => {
    console.error('File upload error:', error);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds limit (max 5MB)'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${error.message}`
        });
    }

    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    next(error);
};

// Upload image to Cloudinary
const uploadToCloudinary = async (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'ricebook',
                transformation: [{ width: 1024, height: 1024, crop: 'limit' }]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
};

// Upload single image
router.post('/image', isLoggedIn, upload.single('image'), async (req, res, next) => {
    try {
        console.log('Processing image upload request');

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please select an image to upload'
            });
        }

        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Image upload successful:', result);

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.secure_url,
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Image upload error:', error);
        next(error);
    }
});

// Upload avatar
router.post('/avatar', isLoggedIn, upload.single('avatar'), async (req, res, next) => {
    try {
        console.log('Processing avatar upload request');

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please select an avatar image to upload'
            });
        }

        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Avatar upload successful:', result);

        // Update user profile with new avatar URL
        const profile = await Profile.findOneAndUpdate(
            { user: req.session.userId },
            { $set: { avatar: result.secure_url } },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                avatar: result.secure_url,
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        next(error);
    }
});

module.exports = router; 