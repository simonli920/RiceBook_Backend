const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
// 导入路由
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const profileRoutes = require('./routes/profileRoutes');
const followingRoutes = require('./routes/followingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// 导入中间件
const { isLoggedIn } = require('./utils/middleware');

// 加载环境变量
dotenv.config();

// 导入数据库连接函数
const connectDB = require('./config/db');

// 连接数据库
connectDB();

const app = express();

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// 会话配置
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// 基础路由
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Backend of RiceBook Social Media API' });
});

// API 路由
app.use('/auth', authRoutes);
app.use('/articles', isLoggedIn, articleRoutes);
app.use('/profiles', isLoggedIn, profileRoutes);
app.use('/following', isLoggedIn, followingRoutes);
app.use('/upload', uploadRoutes);

// 404 处理
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        status: err.status || 500
    });

    // 如果是 Multer 错误
    if (err.name === 'MulterError') {
        return res.status(400).json({
            status: 'error',
            message: 'File upload error',
            details: err.message
        });
    }

    // 如果是 Cloudinary 错误
    if (err.http_code) {
        return res.status(err.http_code).json({
            status: 'error',
            message: 'Cloudinary error',
            details: err.message
        });
    }

    res.status(err.status || 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 