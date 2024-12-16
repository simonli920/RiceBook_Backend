const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Validate Cloudinary configuration
const validateConfig = () => {
    const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required Cloudinary configuration: ${missing.join(', ')}`);
    }
    return true;
};

// Validate configuration
try {
    validateConfig();
} catch (error) {
    console.error('Cloudinary configuration error:', error.message);
    process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Log configuration status (without sensitive data)
console.log('Cloudinary Configuration:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    configured: !!process.env.CLOUDINARY_API_KEY
});

// Configure memory storage for Multer
const storage = multer.memoryStorage();

// Configure Multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        
        // Log file information
        console.log('Upload file info:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        cb(null, true);
    }
});

// Upload file to Cloudinary
const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: 'ricebook',
            resource_type: 'auto',
            transformation: [
                { width: 1024, height: 1024, crop: 'limit' }
            ]
        };

        // Create upload stream
        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    console.log('Cloudinary upload success:', {
                        public_id: result.public_id,
                        url: result.secure_url
                    });
                    resolve(result);
                }
            }
        );

        // Convert buffer to stream and pipe to uploadStream
        const bufferStream = require('stream').Readable.from(file.buffer);
        bufferStream.pipe(uploadStream);
    });
};

module.exports = {
    cloudinary,
    upload,
    uploadToCloudinary
}; 