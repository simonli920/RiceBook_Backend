const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 验证 Cloudinary 配置
console.log('Cloudinary Configuration:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '***' : undefined,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : undefined
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ricebook',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// Configure multer with error handling
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // 打印文件信息
        console.log('Uploading file:', {
            fieldname: file.fieldname,
            mimetype: file.mimetype,
            originalname: file.originalname
        });

        // 检查文件类型
        if (!file.mimetype.startsWith('image/')) {
            console.error('Invalid file type:', file.mimetype);
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制文件大小为 5MB
    }
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'avatar', maxCount: 1 }
]);

// 导出配置和验证函数
module.exports = {
    cloudinary,
    upload,
    validateConfig: () => {
        const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
        const missing = required.filter(key => !process.env[key]);
        if (missing.length > 0) {
            throw new Error(`Missing required Cloudinary configuration: ${missing.join(', ')}`);
        }
        return true;
    }
}; 