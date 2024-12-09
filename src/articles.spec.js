// src/articles.spec.js

process.env.NODE_ENV = 'test'; // 设置测试环境
// require('dotenv').config({ path: '.env.test' }); // 加载测试环境变量（如果需要）

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../index'); // 引入主应用程序
const { User, Profile, Article } = require('./auth.js');
const JasmineReporters = require('jasmine-reporters');
const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://draft-backend-yl330.herokuapp.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// 添加 JUnit 报告器
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
    let mongoServer;

    beforeAll(async () => {
        // 启动内存中的 MongoDB
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        // 连接到内存中的 MongoDB
        await mongoose.disconnect(); // 确保断开任何现有连接
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        agent = request.agent(app);
    });

    afterAll(async () => {
        // 清理数据库并关闭内存中的 MongoDB
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Article.deleteMany({});
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    it('should register a new user', async () => {
        testUserId = 'testUser' + Date.now();
        const response = await agent.post('/register').send({
            username: testUserId,
            password: '123',
            email: 'test@example.com',
            dob: '1990-01-01',
            phone: '123-456-7890',
            zipcode: '12345',
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
        expect(response.body.articles).toBeDefined();
        expect(response.body.articles.length).toBe(1);
        const article = response.body.articles[0];
        expect(article.text).toBe('This is a test article');
        expect(article.author).toBe(testUserId);
        expect(article.pid).toBe(1);
        expect(article.comments).toEqual([]);

        // 验证文章是否在列表中
        const articlesResponse = await agent.get('/articles');
        expect(articlesResponse.statusCode).toBe(200);
        expect(articlesResponse.body.articles.length).toBe(1);
        expect(articlesResponse.body.articles[0].text).toBe('This is a test article');
    });

    it('should update the headline and verify the change', async () => {
        const newHeadline = 'Updated headline';
        const response = await agent.put('/headline').send({
            headline: newHeadline,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.headline).toBe(newHeadline);

        const getHeadlineResponse = await agent.get('/headline');
        expect(getHeadlineResponse.statusCode).toBe(200);
        expect(getHeadlineResponse.body.headline).toBe(newHeadline);
    });

    it('should log out the user', async () => {
        const response = await agent.put('/logout');
        expect(response.statusCode).toBe(200);
    });

    it('should not allow access to protected routes after logout', async () => {
        const response = await agent.get('/articles');
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe('Unauthorized: No session ID');
    });

    // 额外的测试用例

    it('should retrieve an article by PID', async () => {
        // 重新登录用户
        const loginResponse = await agent.post('/login').send({
            username: testUserId,
            password: '123',
        });
        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.body.username).toBe(testUserId);

        // 创建另一篇文章
        const createResponse = await agent.post('/article').send({
            text: 'Second test article',
        });
        expect(createResponse.statusCode).toBe(200);
        expect(createResponse.body.articles.length).toBe(1);
        const secondArticle = createResponse.body.articles[0];
        expect(secondArticle.pid).toBe(2);

        // 通过 PID 获取文章
        const getResponse = await agent.get(`/articles/${secondArticle.pid}`);
        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.body.articles.length).toBe(1);
        const retrievedArticle = getResponse.body.articles[0];
        expect(retrievedArticle.pid).toBe(2);
        expect(retrievedArticle.text).toBe('Second test article');
    });

    it('should return 404 when requesting a non-existent article PID', async () => {
        const response = await agent.get('/articles/999');
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('Article not found');
    });

    it('should add a comment to an article', async () => {
        // 确保已登录
        await agent.post('/login').send({
            username: testUserId,
            password: '123',
        });

        // 创建一篇文章
        const createArticleResponse = await agent.post('/article').send({
            text: 'Article to comment on',
        });
        expect(createArticleResponse.statusCode).toBe(200);
        const article = createArticleResponse.body.articles[0];
        const articlePid = article.pid;

        // 添加评论（commentId: -1 表示添加新评论）
        const commentText = 'This is a comment';
        const addCommentResponse = await agent.put(`/articles/${articlePid}`).send({
            text: commentText,
            commentId: -1, // 表示添加新评论
        });
        expect(addCommentResponse.statusCode).toBe(200);
        expect(addCommentResponse.body.articles.length).toBe(1);
        const updatedArticle = addCommentResponse.body.articles[0];
        expect(updatedArticle.comments.length).toBe(1);
        const comment = updatedArticle.comments[0];
        expect(comment.text).toBe(commentText);
        expect(comment.author).toBe(testUserId);
        expect(comment.commentId).toBe(1);
    });
});