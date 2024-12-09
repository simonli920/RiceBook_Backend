// src/auth.js

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Session handling
const sessionUser = {}; // Session store
const cookieKey = 'sid'; // Session cookie key

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: String,
    hash: String
});

const User = mongoose.model('User', userSchema);

// Profile Schema and Model
const profileSchema = new mongoose.Schema({
    username: String,
    email: String,
    dob: Date,
    phone: String,
    zipcode: String,
    avatar: String,
    following: [String],
    headline: String
});

const Profile = mongoose.model('Profile', profileSchema);

// Article Schema and Model
const articleSchema = new mongoose.Schema({
    author: String,
    text: String,
    date: { type: Date, default: Date.now },
    comments: [{
        commentId: Number,
        author: String,
        text: String,
        date: { type: Date, default: Date.now }
    }],
    pid: Number
});

const Article = mongoose.model('Article', articleSchema);

const setupAuthRoutes = async (app) => {
    const register = async (req, res) => {
        const { username, password, email, dob, phone, zipcode } = req.body;

        try {
            // 检查用户是否已存在
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).send('用户已存在');
            }

            // 创建密码哈希
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            // 创建新用户
            const user = new User({ username, hash });
            await user.save();

            // 创建用户档案
            const profile = new Profile({
                username,
                email,
                dob: new Date(dob),
                phone,
                zipcode
            });
            await profile.save();

            // 创建会话
            const sessionId = Math.random().toString(36).substring(2);
            sessionUser[sessionId] = user;

            // 设置 cookie
            res.cookie(cookieKey, sessionId, {
                maxAge: 3600 * 1000,
                httpOnly: true,
                sameSite: 'None',
                secure: true
            });

            res.status(200).json({ username, result: 'success' });
        } catch (err) {
            res.status(500).send(`注册失败: ${err.message}`);
        }
    };

    const login = async (req, res) => {
        const { username, password } = req.body;

        try {
            // 查找用户
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).send('用户不存在');
            }

            // 验证密码
            const valid = await bcrypt.compare(password, user.hash);
            if (!valid) {
                return res.status(401).send('密码错误');
            }

            // 创建会话
            const sessionId = Math.random().toString(36).substring(2);
            sessionUser[sessionId] = user;

            // 设置 cookie
            res.cookie(cookieKey, sessionId, {
                maxAge: 3600 * 1000,
                httpOnly: true,
                sameSite: 'None',
                secure: true
            });

            res.status(200).json({ username, result: 'success' });
        } catch (err) {
            res.status(500).send(`登录失败: ${err.message}`);
        }
    };

    const logout = (req, res) => {
        const sid = req.cookies[cookieKey];
        delete sessionUser[sid];
        res.clearCookie(cookieKey);
        res.sendStatus(200);
    };

    // 添加测试用户
    const createTestUser = async () => {
        try {
            const testUsername = 'joey';
            const testPassword = 'pass';

            // 检查测试用户是否已存在
            const existingUser = await User.findOne({ username: testUsername });
            if (!existingUser) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(testPassword, salt);

                const user = new User({ username: testUsername, hash });
                await user.save();

                const profile = new Profile({
                    username: testUsername,
                    email: 'joey@test.com',
                    dob: new Date('1990-01-01'),
                    phone: '123-456-7890',
                    zipcode: '12345'
                });
                await profile.save();
                console.log('测试用户创建成功');
            }
        } catch (err) {
            console.error('创建测试用户失败:', err);
        }
    };

    // 设置路由
    app.post('/register', register);
    app.post('/login', login);
    app.put('/logout', logout);

    // 创建测试用户并等待完成
    await createTestUser();

    return {
        User,
        Profile,
        Article,
        sessionUser,
        cookieKey
    };
};

const isLoggedIn = (req, res, next) => {
    const sid = req.cookies[cookieKey];
    if (!sid || !sessionUser[sid]) {
        return res.status(401).send('Unauthorized: No session ID');
    }
    req.username = sessionUser[sid].username;
    next();
};

// 导出中间件
module.exports = {
    isLoggedIn,
    setupAuthRoutes,
    User,
    Profile,
    Article,
    sessionUser,
    cookieKey
};