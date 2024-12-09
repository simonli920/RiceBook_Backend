// index.js

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = ('mongoose');
const cors = require('cors');
// require('dotenv').config(); // 加载环境变量

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://draft-backend-yl330.herokuapp.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// MongoDB connection URI
const dbUser = process.env.DB_USER || 'simonyh920';
const dbPassword = process.env.DB_PASSWORD || 'shuai123'; // 建议使用环境变量
const dbName = process.env.DB_NAME || 'mydb'; // 根据需要替换

const dbUrl = process.env.MONGODB_URI || `mongodb+srv://${dbUser}:${encodeURIComponent(dbPassword)}@cluster0.xiz8l.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

// 仅在非测试环境下连接 MongoDB
if (process.env.NODE_ENV !== 'test') {
    const { connect } = require('mongoose');
    connect(dbUrl)
        .then(() => {
            console.log('Successfully connected to MongoDB.');
            console.log('Database:', dbName);
            console.log('User:', dbUser);
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err);
            process.exit(1);  // 如果连接失败，终止程序
        });
}

// Import and use routes
const authModule = require('./src/auth.js');
await authModule.setupAuthRoutes(app);

const { User, Profile, Article, sessionUser, cookieKey } = authModule;

// Pass models and session variables to other modules
const models = { User, Profile, Article };
const session = { sessionUser, cookieKey };

// Now we can require other modules and pass models and session
require('./src/articles.js')(app, models, session);
require('./src/profile.js')(app, models, session);
require('./src/following.js')(app, models, session);

// 仅在非测试环境下启动服务器
if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

module.exports = app; // Export app for testing
