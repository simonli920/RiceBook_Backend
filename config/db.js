const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;

        const conn = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // 增加超时时间
        });

        // 连接成功
        mongoose.connection.on('connected', () => {
            console.log('MongoDB Atlas connected successfully');
        });

        // 连接错误
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        // 连接断开
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
