const request = require('supertest');
const express = require('express');
const { mockSession, createTestUser } = require('./setup');
const User = require('../models/User');
const Profile = require('../models/Profile');
const uploadRoutes = require('../routes/uploadRoutes');

// Mock Cloudinary
jest.mock('../config/cloudinary', () => {
    const multer = require('multer');
    const storage = multer.memoryStorage();
    const upload = multer({ storage });

    // 添加中间件来模拟文件处理
    const originalSingle = upload.single.bind(upload);
    upload.single = (fieldName) => (req, res, next) => {
        originalSingle(fieldName)(req, res, (err) => {
            if (err) return next(err);
            if (req.file) {
                req.file.path = 'https://res.cloudinary.com/demo/image/upload/test.jpg';
            }
            next();
        });
    };

    return { upload };
});

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    req.session = mockSession.session;
    next();
});
app.use('/upload', uploadRoutes);

describe('Upload Routes', () => {
    let testUser;
    let testProfile;

    beforeEach(async () => {
        const result = await createTestUser(User, Profile);
        testUser = result.user;
        testProfile = result.profile;
        mockSession.session.userId = testUser._id;
    });

    describe('POST /upload/image', () => {
        it('should upload an image successfully', async () => {
            const response = await request(app)
                .post('/upload/image')
                .attach('image', Buffer.from('fake-image'), 'test.jpg');

            expect(response.status).toBe(200);
            expect(response.body.imageUrl).toBe('https://res.cloudinary.com/demo/image/upload/test.jpg');
        });

        it('should handle missing image file', async () => {
            const response = await request(app)
                .post('/upload/image');

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('No image file provided');
        });
    });

    describe('POST /upload/avatar', () => {
        it('should upload an avatar and update profile', async () => {
            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake-avatar'), 'avatar.jpg');

            expect(response.status).toBe(200);
            expect(response.body.avatar).toBe('https://res.cloudinary.com/demo/image/upload/test.jpg');

            // Verify profile was updated
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.avatar).toBe('https://res.cloudinary.com/demo/image/upload/test.jpg');
        });

        it('should handle missing avatar file', async () => {
            const response = await request(app)
                .post('/upload/avatar');

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('No avatar image provided');
        });
    });
}); 