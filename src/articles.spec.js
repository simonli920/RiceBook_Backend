const request = require('supertest');
const app = require('../index');

describe('Articles API', () => {
    it('should return all articles', async () => {
        const response = await request(app).get('/articles');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should add a new article', async () => {
        const response = await request(app).post('/article').send({ text: 'New article' });
        expect(response.statusCode).toBe(200);
        expect(response.body.text).toBe('New article');
    });
});