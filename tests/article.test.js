const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { mockSession, createTestUser } = require('./setup');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Article = require('../models/Article');
const articleRoutes = require('../routes/articleRoutes');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    req.session = mockSession.session;
    next();
});
app.use('/articles', articleRoutes);

describe('Article Routes', () => {
    let testUser;
    let testArticle;

    beforeEach(async () => {
        const result = await createTestUser(User, Profile);
        testUser = result.user;
        mockSession.session.userId = testUser._id;

        // Create a test article
        testArticle = new Article({
            author: testUser._id,
            text: 'Test article content'
        });
        await testArticle.save();
    });

    describe('GET /articles', () => {
        it('should get articles with pagination', async () => {
            // Create multiple articles
            const articles = [];
            for (let i = 0; i < 15; i++) {
                articles.push({
                    author: testUser._id,
                    text: `Article ${i}`
                });
            }
            await Article.insertMany(articles);

            const response = await request(app)
                .get('/articles')
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.articles.length).toBe(10);
            expect(response.body.totalPages).toBe(2);
            expect(response.body.currentPage).toBe(1);
        });

        it('should get articles for user and following', async () => {
            // Create another user and follow them
            const otherUser = new User({
                username: 'otheruser',
                password: 'password123',
                email: 'other@example.com'
            });
            await otherUser.save();

            const otherArticle = new Article({
                author: otherUser._id,
                text: 'Other user article'
            });
            await otherArticle.save();

            const userProfile = await Profile.findOne({ user: testUser._id });
            userProfile.following.push(otherUser._id);
            await userProfile.save();

            const response = await request(app).get('/articles');

            expect(response.status).toBe(200);
            expect(response.body.articles.length).toBe(2); // Should get both articles
        });
    });

    describe('GET /articles/:id', () => {
        it('should get a single article', async () => {
            const response = await request(app)
                .get(`/articles/${testArticle._id}`);

            expect(response.status).toBe(200);
            expect(response.body.text).toBe('Test article content');
        });

        it('should return 404 for non-existent article', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/articles/${fakeId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /articles', () => {
        it('should create a new article', async () => {
            const response = await request(app)
                .post('/articles')
                .send({
                    text: 'New article content',
                    image: 'http://example.com/image.jpg'
                });

            expect(response.status).toBe(201);
            expect(response.body.text).toBe('New article content');
            expect(response.body.image).toBe('http://example.com/image.jpg');
        });
    });

    describe('PUT /articles/:id', () => {
        it('should update an article', async () => {
            const response = await request(app)
                .put(`/articles/${testArticle._id}`)
                .send({
                    text: 'Updated content',
                    image: 'http://example.com/new-image.jpg'
                });

            expect(response.status).toBe(200);
            expect(response.body.text).toBe('Updated content');
            expect(response.body.image).toBe('http://example.com/new-image.jpg');
        });

        it('should not update article of different user', async () => {
            const otherUser = new User({
                username: 'otheruser',
                password: 'password123',
                email: 'other@example.com'
            });
            await otherUser.save();

            const otherArticle = new Article({
                author: otherUser._id,
                text: 'Other user article'
            });
            await otherArticle.save();

            const response = await request(app)
                .put(`/articles/${otherArticle._id}`)
                .send({
                    text: 'Trying to update'
                });

            expect(response.status).toBe(403);
        });
    });

    describe('POST /articles/:id/comments', () => {
        it('should add a comment to an article', async () => {
            const response = await request(app)
                .post(`/articles/${testArticle._id}/comments`)
                .send({
                    text: 'Test comment'
                });

            expect(response.status).toBe(200);
            expect(response.body.comments.length).toBe(1);
            expect(response.body.comments[0].text).toBe('Test comment');
            expect(response.body.comments[0].author._id.toString()).toBe(testUser._id.toString());
        });

        it('should return 404 for non-existent article', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .post(`/articles/${fakeId}/comments`)
                .send({
                    text: 'Test comment'
                });

            expect(response.status).toBe(404);
        });
    });
}); 