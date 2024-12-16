const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { mockSession, createTestUser } = require('./setup');
const User = require('../models/User');
const Profile = require('../models/Profile');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    req.session = mockSession.session;
    next();
});
app.use('/auth', authRoutes);

describe('Authentication Routes', () => {
    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    username: 'newuser',
                    password: 'password123',
                    email: 'new@example.com',
                    dob: '1990-01-01'
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Registration successful');
            expect(response.body.username).toBe('newuser');

            // Verify user was created in database
            const user = await User.findOne({ username: 'newuser' });
            expect(user).toBeTruthy();
            expect(user.email).toBe('new@example.com');

            // Verify profile was created
            const profile = await Profile.findOne({ user: user._id });
            expect(profile).toBeTruthy();
            expect(profile.email).toBe('new@example.com');
        });

        it('should not register user with existing username', async () => {
            await createTestUser(User, Profile);

            const response = await request(app)
                .post('/auth/register')
                .send({
                    username: 'testuser',
                    password: 'password123',
                    email: 'another@example.com',
                    dob: '1990-01-01'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('exists');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            await createTestUser(User, Profile);
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.username).toBe('testuser');
        });

        it('should fail with incorrect password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Invalid');
        });

        it('should fail with non-existent username', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: 'nonexistent',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Invalid');
        });
    });

    describe('PUT /auth/logout', () => {
        beforeEach(async () => {
            const { user } = await createTestUser(User, Profile);
            mockSession.session.userId = user._id;
        });

        it('should logout successfully', async () => {
            const response = await request(app)
                .put('/auth/logout');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logout successful');
        });
    });

    describe('PUT /auth/password', () => {
        beforeEach(async () => {
            const { user } = await createTestUser(User, Profile);
            mockSession.session.userId = user._id;
        });

        it('should update password successfully', async () => {
            const response = await request(app)
                .put('/auth/password')
                .send({
                    oldPassword: 'password123',
                    newPassword: 'newpassword123'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Password updated successfully');

            // Verify new password works
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'newpassword123'
                });

            expect(loginResponse.status).toBe(200);
        });

        it('should fail with incorrect old password', async () => {
            const response = await request(app)
                .put('/auth/password')
                .send({
                    oldPassword: 'wrongpassword',
                    newPassword: 'newpassword123'
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('incorrect');
        });
    });
}); 