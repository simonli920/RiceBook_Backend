const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Validate environment variables
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

// Log configuration info (without sensitive data)
console.log('Cloudinary Configuration:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    configured: !!process.env.CLOUDINARY_API_KEY
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ricebook',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 1024, height: 1024, crop: 'limit' }],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `${file.fieldname}-${uniqueSuffix}`;
        }
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    
    // Log file information (actual size limit is enforced in multer config)
    console.log('Upload file info:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });
    
    cb(null, true);
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
        files: 1 // Allow only one file per request
    }
});

// Export configuration and middleware
module.exports = {
    cloudinary,
    upload,
    validateConfig
}; 