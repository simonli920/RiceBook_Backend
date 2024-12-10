// index.js

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://d-backend-e2d47c6a3db5.herokuapp.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB connection URI
const dbUser = process.env.DB_USER || 'simonyh920';
const dbPassword = process.env.DB_PASSWORD || 'shuai123';
const dbName = process.env.DB_NAME || 'mydb';

const dbUrl = process.env.MONGODB_URI || `mongodb+srv://${dbUser}:${encodeURIComponent(dbPassword)}@cluster0.xiz8l.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

// 仅在非测试环境下连接 MongoDB
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(dbUrl)
        .then(() => {
            console.log('Successfully connected to MongoDB.');
            console.log('Database:', dbName);
            console.log('User:', dbUser);
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });
}

async function initializeApp() {
    try {
        app.get('/', (req, res) => {
            res.json({
                message: 'Backend server is running',
                endpoints: {
                    register: 'POST /register',
                    login: 'POST /login',
                    logout: 'PUT /logout',
                    articles: 'GET /articles',
                    createArticle: 'POST /article'
                }
            });
        });

        const authModule = require('./src/auth.js');
        await authModule.setupAuthRoutes(app);

        const { User, Profile, Article, sessionUser, cookieKey } = authModule;

        const models = { User, Profile, Article };
        const session = { sessionUser, cookieKey };

        require('./src/articles.js')(app, models, session);
        require('./src/profile.js')(app, models, session);
        require('./src/following.js')(app, models, session);

        if (process.env.NODE_ENV !== 'test') {
            const port = process.env.PORT || 3000;
            app.listen(port, () => {
                console.log(`Server is running on http://localhost:${port}`);
            });
        }

        return app;
    } catch (error) {
        console.error('初始化失败:', error);
        process.exit(1);
    }
}

// 导出初始化后的应用
// module.exports = (async () => {
//     try {
//         return await initializeApp();
//     } catch (err) {
//         console.error('Failed to initialize app:', err);
//         throw err;
//     }
// })();
module.exports = initializeApp();
