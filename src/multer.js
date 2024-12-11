// src/multer.js

const multer = require('multer');
const { cloudinary } = require('./cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avatars',
        allowed_formats: ['jpg', 'png'],
    },
});

const upload = multer({ storage: storage });

module.exports = { upload };