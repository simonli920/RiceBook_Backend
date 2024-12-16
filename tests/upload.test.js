const request = require('supertest');
const express = require('express');
const path = require('path');
const { mockSession, createTestUser } = require('./setup');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Mock Cloudinary and multer
jest.mock('cloudinary');
jest.mock('multer-storage-cloudinary');
jest.mock('../config/cloudinary', () => ({
    upload: {
        single: (fieldName) => (req, res, next) => {
            if (req.headers['content-type']?.includes('multipart/form-data')) {
                req.file = {
                    path: `https://res.cloudinary.com/demo/image/upload/sample.jpg`,
                    filename: 'sample.jpg',
                    originalname: 'sample.jpg',
                    mimetype: 'image/jpeg',
                    size: 1024
                };
            }
            next();
        }
    },
    uploadToCloudinary: async (file) => {
        return {
            secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            public_id: 'sample',
            original_filename: file.originalname
        };
    }
}));

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    req.session = mockSession.session;
    next();
});

const uploadRoutes = require('../routes/uploadRoutes');
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
                .attach('image', Buffer.from('fake image data'), 'test-image.jpg');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Image uploaded successfully');
            expect(response.body.data.url).toMatch(/^https:\/\/res\.cloudinary\.com/);
        });

        it('should return 400 if no image is provided', async () => {
            const response = await request(app)
                .post('/upload/image');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Please select an image to upload');
        });

        it('should return 401 if user is not logged in', async () => {
            mockSession.session.userId = null;

            const response = await request(app)
                .post('/upload/image')
                .attach('image', Buffer.from('fake image data'), 'test-image.jpg');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /upload/avatar', () => {
        it('should upload an avatar successfully', async () => {
            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake avatar data'), 'test-avatar.jpg');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Avatar uploaded successfully');
            expect(response.body.data.avatar).toMatch(/^https:\/\/res\.cloudinary\.com/);

            // Verify profile was updated
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.avatar).toMatch(/^https:\/\/res\.cloudinary\.com/);
        });

        it('should return 400 if no avatar is provided', async () => {
            const response = await request(app)
                .post('/upload/avatar');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Please select an avatar image to upload');
        });

        it('should return 401 if user is not logged in', async () => {
            mockSession.session.userId = null;

            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake avatar data'), 'test-avatar.jpg');

            expect(response.status).toBe(401);
        });

        it('should update existing profile with new avatar', async () => {
            // First upload
            await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake avatar data 1'), 'test-avatar1.jpg');

            // Second upload
            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake avatar data 2'), 'test-avatar2.jpg');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Avatar uploaded successfully');

            // Verify profile was updated
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.avatar).toBe(response.body.data.avatar);
        });
    });
}); 