// src/profile.spec.js

process.env.NODE_ENV = 'test'; // 设置测试环境
// require('dotenv').config({ path: '.env.test' }); // 加载测试环境变量（如果需要）

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../index'); // 引入主应用程序
const { User, Profile } = require('./auth.js');
const JasmineReporters = require('jasmine-reporters');

// 添加 JUnit 报告器
jasmine.getEnv().addReporter(
    new JasmineReporters.JUnitXmlReporter({
        savePath: './',
        consolidateAll: true,
        filePrefix: 'junit-report'
    })
);

describe('Profile API Tests', () => {
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

        // 注册并登录测试用户
        testUserId = 'testUser' + Date.now();
        const registerResponse = await agent.post('/register').send({
            username: testUserId,
            password: '123',
            email: 'test@example.com',
            dob: '1990-01-01',
            phone: '123-456-7890',
            zipcode: '12345',
        });
        expect(registerResponse.statusCode).toBe(200);
        expect(registerResponse.body.username).toBe(testUserId);

        const loginResponse = await agent.post('/login').send({
            username: testUserId,
            password: '123',
        });
        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.body.username).toBe(testUserId);
    });

    afterAll(async () => {
        // 清理数据库并关闭内存中的 MongoDB
        await User.deleteMany({});
        await Profile.deleteMany({});
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    it('should get the profile headline', async () => {
        const response = await agent.get('/headline');
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe(testUserId);
        expect(response.body.headline).toBe('Hello, this is my profile!');
    });

    it('should update the profile headline', async () => {
        const newHeadline = 'New headline';
        const response = await agent.put('/headline').send({
            headline: newHeadline,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.headline).toBe(newHeadline);

        const getResponse = await agent.get('/headline');
        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.body.headline).toBe(newHeadline);
    });

    it('should get the email address', async () => {
        const response = await agent.get('/email');
        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe('test@example.com');
    });

    it('should update the email address', async () => {
        const newEmail = 'newemail@example.com';
        const response = await agent.put('/email').send({
            email: newEmail,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe(newEmail);

        const getResponse = await agent.get('/email');
        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.body.email).toBe(newEmail);
    });

    // 额外的测试用例

    it('should get the zipcode', async () => {
        const response = await agent.get('/zipcode');
        expect(response.statusCode).toBe(200);
        expect(response.body.zipcode).toBe('12345');
    });

    it('should update the zipcode', async () => {
        const newZipcode = '54321';
        const response = await agent.put('/zipcode').send({
            zipcode: newZipcode,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.zipcode).toBe(newZipcode);

        const getResponse = await agent.get('/zipcode');
        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.body.zipcode).toBe(newZipcode);
    });

    it('should get the phone number', async () => {
        const response = await agent.get('/phone');
        expect(response.statusCode).toBe(200);
        expect(response.body.phone).toBe('123-456-7890');
    });

    it('should update the phone number', async () => {
        const newPhone = '098-765-4321';
        const response = await agent.put('/phone').send({
            phone: newPhone,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.phone).toBe(newPhone);

        const getResponse = await agent.get('/phone');
        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.body.phone).toBe(newPhone);
    });

    it('should get the date of birth', async () => {
        const response = await agent.get('/dob');
        expect(response.statusCode).toBe(200);
        // 检查 dob 是否正确（转换为时间戳）
        const expectedDob = new Date('1990-01-01').getTime();
        expect(response.body.dob).toBe(expectedDob);
    });

    it('should get the avatar', async () => {
        const response = await agent.get('/avatar');
        expect(response.statusCode).toBe(200);
        expect(response.body.avatar).toBe(''); // 初始头像为空
    });

    it('should update the avatar', async () => {
        const newAvatar = 'http://example.com/avatar.png';
        const response = await agent.put('/avatar').send({
            avatar: newAvatar,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.avatar).toBe(newAvatar);

        const getResponse = await agent.get('/avatar');
        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.body.avatar).toBe(newAvatar);
    });
});