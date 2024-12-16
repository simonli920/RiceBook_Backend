const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { mockSession, createTestUser } = require('./setup');
const User = require('../models/User');
const Profile = require('../models/Profile');
const followingRoutes = require('../routes/followingRoutes');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    req.session = mockSession.session;
    next();
});
app.use('/following', followingRoutes);

describe('Following Routes', () => {
    let testUser;
    let testProfile;
    let otherUser;

    beforeEach(async () => {
        const result = await createTestUser(User, Profile);
        testUser = result.user;
        testProfile = result.profile;
        mockSession.session.userId = testUser._id;

        // Create another user to follow
        otherUser = new User({
            username: 'otheruser',
            password: 'password123',
            email: 'other@example.com'
        });
        await otherUser.save();
    });

    describe('GET /following/:user?', () => {
        it('should get empty following list initially', async () => {
            const response = await request(app)
                .get('/following');

            expect(response.status).toBe(200);
            expect(response.body.following).toEqual([]);
        });

        it('should get following list with followed users', async () => {
            // Add a user to following list
            testProfile.following.push(otherUser._id);
            await testProfile.save();

            const response = await request(app)
                .get('/following');

            expect(response.status).toBe(200);
            expect(response.body.following.length).toBe(1);
            expect(response.body.following[0].username).toBe('otheruser');
        });

        it('should get another user\'s following list', async () => {
            const response = await request(app)
                .get(`/following/${testUser._id}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.following)).toBe(true);
        });
    });

    describe('PUT /following/:username', () => {
        it('should add user to following list', async () => {
            const response = await request(app)
                .put(`/following/${otherUser.username}`);

            expect(response.status).toBe(200);
            expect(response.body.following.length).toBe(1);
            expect(response.body.following[0].username).toBe('otheruser');

            // Verify in database
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.following.length).toBe(1);
            expect(updatedProfile.following[0].toString()).toBe(otherUser._id.toString());
        });

        it('should not add non-existent user', async () => {
            const response = await request(app)
                .put('/following/nonexistentuser');

            expect(response.status).toBe(404);
        });

        it('should not add already followed user', async () => {
            // First follow
            await request(app).put(`/following/${otherUser.username}`);

            // Try to follow again
            const response = await request(app)
                .put(`/following/${otherUser.username}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Already following');
        });
    });

    describe('DELETE /following/:username', () => {
        beforeEach(async () => {
            // Add user to following list
            testProfile.following.push(otherUser._id);
            await testProfile.save();
        });

        it('should remove user from following list', async () => {
            const response = await request(app)
                .delete(`/following/${otherUser.username}`);

            expect(response.status).toBe(200);
            expect(response.body.following.length).toBe(0);

            // Verify in database
            const updatedProfile = await Profile.findOne({ user: testUser._id });
            expect(updatedProfile.following.length).toBe(0);
        });

        it('should not remove non-existent user', async () => {
            const response = await request(app)
                .delete('/following/nonexistentuser');

            expect(response.status).toBe(404);
        });

        it('should not remove user not in following list', async () => {
            // First unfollow
            await request(app).delete(`/following/${otherUser.username}`);

            // Try to unfollow again
            const response = await request(app)
                .delete(`/following/${otherUser.username}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Not following');
        });
    });
}); 