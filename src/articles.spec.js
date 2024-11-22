// src/articles.spec.js

const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Article = require('./models/Article');
const JasmineReporters = require('jasmine-reporters');

jasmine.getEnv().addReporter(
    new JasmineReporters.JUnitXmlReporter({
        savePath: './',
        consolidateAll: true,
        filePrefix: 'junit-report'
    })
);

describe('Backend API Tests', () => {
    let agent;
    let testUserId;

    beforeAll(async () => {
        // Connect to the test database
        const dbUrl = 'mongodb://localhost:27017/testdb';
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        agent = request.agent(app);
    });

    afterAll(async () => {
        // Clean up database and close connection
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Article.deleteMany({});
        await mongoose.connection.close();
    });

    it('should register a new user', async () => {
        testUserId = 'testUser' + new Date().getTime();
        const response = await agent.post('/register').send({
            username: testUserId,
            password: '123',
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe(testUserId);
    });

    it('should log in as the new user', async () => {
        const response = await agent.post('/login').send({
            username: testUserId,
            password: '123',
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe(testUserId);
    });

    it('should create a new article and verify it was added', async () => {
        const response = await agent.post('/article').send({
            text: 'This is a test article',
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.text).toBe('This is a test article');
        expect(response.body.author).toBe(testUserId);

        const articlesResponse = await agent.get('/articles');
        expect(articlesResponse.body.length).toBe(1);
    });

    it('should update the headline and verify the change', async () => {
        const newHeadline = 'Updated headline';
        const response = await agent.put('/headline').send({
            headline: newHeadline,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.headline).toBe(newHeadline);

        const getHeadlineResponse = await agent.get('/headline');
        expect(getHeadlineResponse.body.headline).toBe(newHeadline);
    });

    it('should log out the user', async () => {
        const response = await agent.put('/logout');
        expect(response.statusCode).toBe(200);
    });

    it('should not allow access to protected routes after logout', async () => {
        const response = await agent.get('/articles');
        expect(response.statusCode).toBe(401);
    });
});
