jest.setTimeout(10000); // 设置测试超时时间为10秒

// 在所有测试之前连接到测试数据库
beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'mongodb+srv://simonyh920:your_password@cluster0.xiz8l.mongodb.net/testdb';
}); 