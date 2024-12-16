const request = require('supertest');
const express = require('express');
const { mockSession, createTestUser } = require('./setup');
const User = require('../models/User');
const Profile = require('../models/Profile');
const uploadRoutes = require('../routes/uploadRoutes');

// Mock Cloudinary
jest.mock('../config/cloudinary', () => ({
    upload: {
        single: (fieldName) => (req, res, next) => {
            // 模拟文件上传
            if (req.files && req.files[fieldName]) {
                req.file = {
                    path: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
                    originalname: 'test.jpg',
                    mimetype: 'image/jpeg',
                    size: 1024
                };
            } else if (req.file) {
                // 如果是通过 supertest 的 attach 方法上传的文件
                req.file.path = 'https://res.cloudinary.com/demo/image/upload/test.jpg';
                req.file.originalname = 'test.jpg';
                req.file.mimetype = 'image/jpeg';
                req.file.size = 1024;
            }
            next();
        }
    }
}));

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    req.session = mockSession.session;
    next();
});
app.use('/upload', uploadRoutes);

describe('上传路由测试', () => {
    let testUser;
    let testProfile;

    beforeEach(async () => {
        const result = await createTestUser(User, Profile);
        testUser = result.user;
        testProfile = result.profile;
        mockSession.session.userId = testUser._id;
    });

    describe('POST /upload/image', () => {
        it('应该成功上传图片', async () => {
            const response = await request(app)
                .post('/upload/image')
                .attach('image', Buffer.from('fake-image'), 'test.jpg');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.url).toBe('https://res.cloudinary.com/demo/image/upload/test.jpg');
            expect(response.body.data.filename).toBe('test.jpg');
            expect(response.body.data.mimetype).toBe('image/jpeg');
        });

        it('应该处理缺少图片文件的情况', async () => {
            const response = await request(app)
                .post('/upload/image');

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('请选择要上传的图片');
        });
    });

    describe('POST /upload/avatar', () => {
        it('应该成功上传头像并更新档案', async () => {
            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake-avatar'), 'avatar.jpg');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.avatar).toBe('https://res.cloudinary.com/demo/image/upload/test.jpg');
            expect(response.body.data.filename).toBe('test.jpg');
            expect(response.body.data.mimetype).toBe('image/jpeg');

            // 验证档案是否更新
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.avatar).toBe('https://res.cloudinary.com/demo/image/upload/test.jpg');
        });

        it('应该处理缺少头像文件的情况', async () => {
            const response = await request(app)
                .post('/upload/avatar');

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('请选择要上传的头像图片');
        });
    });
}); 