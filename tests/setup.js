const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Connect to the in-memory database before all tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// Clear all test data after each test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
});

// Disconnect and stop the in-memory database after all tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Mock session middleware
const mockSession = {
    session: {
        userId: null,
        destroy: callback => callback()
    }
};

// Helper function to create a test user
const createTestUser = async (User, Profile) => {
    // Create user first
    const user = new User({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
    });
    await user.save();

    // Create profile after user is saved
    const profile = new Profile({
        user: user._id,
        username: user.username,
        email: 'test@example.com',
        dob: new Date('1990-01-01'),
        headline: 'A new RiceBook user',
        zipcode: '00000',
        phone: '000-000-0000',
        avatar: 'https://via.placeholder.com/150'
    });
    await profile.save();

    return { user, profile };
};

module.exports = {
    mockSession,
    createTestUser
}; 