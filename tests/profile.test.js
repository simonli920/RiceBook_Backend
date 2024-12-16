const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { mockSession, createTestUser } = require('./setup');
const User = require('../models/User');
const Profile = require('../models/Profile');
const profileRoutes = require('../routes/profileRoutes');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    req.session = mockSession.session;
    next();
});
app.use('/profiles', profileRoutes);

describe('Profile Routes', () => {
    let testUser;
    let testProfile;

    beforeEach(async () => {
        const result = await createTestUser(User, Profile);
        testUser = result.user;
        testProfile = result.profile;
        mockSession.session.userId = testUser._id;
    });

    describe('GET /profiles/headline/:username?', () => {
        it('should get own headline', async () => {
            const response = await request(app)
                .get('/profiles/headline');

            expect(response.status).toBe(200);
            expect(response.body.headline).toBe('A new RiceBook user');
        });

        it('should get another user\'s headline', async () => {
            const response = await request(app)
                .get(`/profiles/headline/${testUser.username}`);

            expect(response.status).toBe(200);
            expect(response.body.headline).toBe('A new RiceBook user');
        });
    });

    describe('PUT /profiles/headline', () => {
        it('should update headline', async () => {
            const response = await request(app)
                .put('/profiles/headline')
                .send({ headline: 'New headline' });

            expect(response.status).toBe(200);
            expect(response.body.headline).toBe('New headline');

            // Verify in database
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.headline).toBe('New headline');
        });
    });

    describe('GET /profiles/email/:username?', () => {
        it('should get own email', async () => {
            const response = await request(app)
                .get('/profiles/email');

            expect(response.status).toBe(200);
            expect(response.body.email).toBe('test@example.com');
        });

        it('should get another user\'s email', async () => {
            const response = await request(app)
                .get(`/profiles/email/${testUser.username}`);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe('test@example.com');
        });
    });

    describe('PUT /profiles/email', () => {
        it('should update email', async () => {
            const response = await request(app)
                .put('/profiles/email')
                .send({ email: 'new@example.com' });

            expect(response.status).toBe(200);
            expect(response.body.email).toBe('new@example.com');

            // Verify in database
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.email).toBe('new@example.com');
        });
    });

    describe('GET /profiles/zipcode/:username?', () => {
        it('should get own zipcode', async () => {
            const response = await request(app)
                .get('/profiles/zipcode');

            expect(response.status).toBe(200);
            expect(response.body.zipcode).toBe('00000');
        });

        it('should get another user\'s zipcode', async () => {
            const response = await request(app)
                .get(`/profiles/zipcode/${testUser.username}`);

            expect(response.status).toBe(200);
            expect(response.body.zipcode).toBe('00000');
        });
    });

    describe('PUT /profiles/zipcode', () => {
        it('should update zipcode', async () => {
            const response = await request(app)
                .put('/profiles/zipcode')
                .send({ zipcode: '12345' });

            expect(response.status).toBe(200);
            expect(response.body.zipcode).toBe('12345');

            // Verify in database
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.zipcode).toBe('12345');
        });
    });

    describe('GET /profiles/phone/:username?', () => {
        it('should get own phone', async () => {
            const response = await request(app)
                .get('/profiles/phone');

            expect(response.status).toBe(200);
            expect(response.body.phone).toBe('000-000-0000');
        });

        it('should get another user\'s phone', async () => {
            const response = await request(app)
                .get(`/profiles/phone/${testUser.username}`);

            expect(response.status).toBe(200);
            expect(response.body.phone).toBe('000-000-0000');
        });
    });

    describe('PUT /profiles/phone', () => {
        it('should update phone', async () => {
            const response = await request(app)
                .put('/profiles/phone')
                .send({ phone: '123-456-7890' });

            expect(response.status).toBe(200);
            expect(response.body.phone).toBe('123-456-7890');

            // Verify in database
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.phone).toBe('123-456-7890');
        });
    });

    describe('GET /profiles/dob', () => {
        it('should get own date of birth', async () => {
            const response = await request(app)
                .get('/profiles/dob');

            expect(response.status).toBe(200);
            expect(new Date(response.body.dob)).toEqual(new Date('1990-01-01'));
        });
    });

    describe('GET /profiles/avatar/:username?', () => {
        it('should get own avatar', async () => {
            const response = await request(app)
                .get('/profiles/avatar');

            expect(response.status).toBe(200);
            expect(response.body.avatar).toBe('https://via.placeholder.com/150');
        });

        it('should get another user\'s avatar', async () => {
            const response = await request(app)
                .get(`/profiles/avatar/${testUser.username}`);

            expect(response.status).toBe(200);
            expect(response.body.avatar).toBe('https://via.placeholder.com/150');
        });
    });

    describe('PUT /profiles/avatar', () => {
        it('should update avatar', async () => {
            const response = await request(app)
                .put('/profiles/avatar')
                .send({ avatar: 'http://example.com/avatar.jpg' });

            expect(response.status).toBe(200);
            expect(response.body.avatar).toBe('http://example.com/avatar.jpg');

            // Verify in database
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.avatar).toBe('http://example.com/avatar.jpg');
        });
    });
}); 