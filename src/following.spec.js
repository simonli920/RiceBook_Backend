const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../index');
const { User, Profile } = require('./auth.js');

describe('Following API Tests', () => {
    let agent;
    let testUser1;
    let testUser2;
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        agent = request.agent(app);

        // 创建两个测试用户
        testUser1 = 'testUser1' + Date.now();
        testUser2 = 'testUser2' + Date.now();

        // 注册用户1
        await agent.post('/register').send({
            username: testUser1,
            password: '123'
        });

        // 注册用户2
        await request(app).post('/register').send({
            username: testUser2,
            password: '123'
        });

        // 登录用户1
        await agent.post('/login').send({
            username: testUser1,
            password: '123'
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should follow a user', async () => {
        const response = await agent.put(`/following/${testUser2}`);
        expect(response.status).toBe(200);
        expect(response.body.following).toContain(testUser2);
    });

    it('should get following list', async () => {
        const response = await agent.get('/following');
        expect(response.status).toBe(200);
        expect(response.body.following).toContain(testUser2);
    });

    it('should unfollow a user', async () => {
        const response = await agent.delete(`/following/${testUser2}`);
        expect(response.status).toBe(200);
        expect(response.body.following).not.toContain(testUser2);
    });
}); 