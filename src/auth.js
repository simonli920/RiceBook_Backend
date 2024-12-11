// src/auth.js

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');

// Session handling
const sessionUser = {}; // Session store
const cookieKey = 'sid'; // Session cookie key

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: String,
    hash: String,
    oauth: {
        google: {
            id: String,
            displayName: String
        }
    }
});

const User = mongoose.model('User', userSchema);

// Profile Schema and Model
const profileSchema = new mongoose.Schema({
    username: { type: String, required: true },
    headline: { type: String, default: '' },
    email: { type: String, default: '' },
    dob: { 
        type: Date, 
        default: Date.now,
        set: function(value) {
            // 如果是字符串日期，转换为 Date 对象
            if (typeof value === 'string') {
                return new Date(value);
            }
            return value;
        }
    },
    phone: { type: String, default: '' },
    zipcode: { type: String, default: '' },
    avatar: { type: String, default: '' },
    following: { type: [String], default: [] }
});

const Profile = mongoose.model('profile', profileSchema);

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
                return res.status(400).send('User already exists');
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
                headline: '',
                email: email || '',
                dob: dob ? new Date(dob) : new Date(),
                phone: phone || '',
                zipcode: zipcode || '',
                avatar: '',
                following: []
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
            res.status(500).send(`Registration failed: ${err.message}`);
        }
    };

    const login = async (req, res) => {
        const { username, password } = req.body;

        try {
            // 查找用户
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).send('User does not exist');
            }

            // 验证密码
            const valid = await bcrypt.compare(password, user.hash);
            if (!valid) {
                return res.status(401).send('Incorrect password');
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
            res.status(500).send(`Login failed: ${err.message}`);
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

    const updatePassword = async (req, res) => {
        const { password } = req.body;
        if (!password) {
            return res.status(400).send('密码不能为空');
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            await User.findOneAndUpdate(
                { username: req.username },
                { hash }
            );

            res.status(200).json({ username: req.username, status: 'password updated' });
        } catch (err) {
            res.status(500).send(`Failed to update password: ${err.message}`);
        }
    };

    // 配置 Passport 序列化和反序列化用户
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

    // 配置 Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // 在数据库中查找用户
            let user = await User.findOne({ 'oauth.google.id': profile.id });

            if (!user) {
                // 如果用户不存在，创建新用户
                user = new User({
                    username: `google_${profile.id}`,
                    oauth: {
                        google: {
                            id: profile.id,
                            displayName: profile.displayName
                        }
                    }
                });
                await user.save();

                // 创建用户的 Profile
                const newProfile = new Profile({
                    username: user.username,
                    // 可以根据需要添加更多字段
                });
                await newProfile.save();
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    // 处理账户关联
    app.post('/link/google', isLoggedIn, passport.authenticate('google-link'));

    passport.use('google-link', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            const user = await User.findOne({ username: req.username });
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }
            
            if (user.oauth && user.oauth.google) {
                return done(null, user, { message: 'Account already linked' });
            }
            
            user.oauth = user.oauth || {};
            user.oauth.google = {
                id: profile.id,
                displayName: profile.displayName
            };
            await user.save();
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    // 处理账户解绑
    app.post('/unlink/google', isLoggedIn, async (req, res) => {
        const user = await User.findOne({ username: req.username });
        if (user && user.oauth && user.oauth.google) {
            delete user.oauth.google;
            await user.save();
            res.status(200).send('Google account unlinked');
        } else {
            res.status(400).send('No Google account linked');
        }
    });

    // 初始化 Passport 中间件
    app.use(passport.initialize());
    app.use(passport.session());

    // Google OAuth 路由
    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/auth/google/callback',
        passport.authenticate('google', { 
            failureRedirect: 'https://womanly-shake-frontend.surge.sh/login',
            successRedirect: 'https://womanly-shake-frontend.surge.sh'
        })
    );

    // 设置路由
    app.post('/register', register);
    app.post('/login', login);
    app.put('/logout', logout);
    app.put('/password', isLoggedIn, updatePassword);

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
    if (!sid) {
        return res.status(401).send('Unauthorized: No session ID');
    }

    const user = sessionUser[sid];
    if (!user) {
        return res.status(401).send('Unauthorized: Invalid session ID');
    }

    req.username = user.username;
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

