const md5 = require('md5');

const sessionUser = {};
const cookieKey = 'sid';

const users = []; // 模拟数据库

const login = (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).send('User not found');
    const hash = md5(user.salt + password);
    if (hash !== user.hash) return res.status(401).send('Invalid password');
    const sessionKey = md5(username + new Date().getTime());
    sessionUser[sessionKey] = user;
    res.cookie(cookieKey, sessionKey, { httpOnly: true });
    res.status(200).send({ username });
};

const logout = (req, res) => {
    const sid = req.cookies[cookieKey];
    delete sessionUser[sid];
    res.clearCookie(cookieKey);
    res.status(200).send('Logged out');
};

const register = (req, res) => {
    const { username, password } = req.body;
    const salt = md5(username + new Date().getTime());
    const hash = md5(salt + password);
    users.push({ username, salt, hash });
    res.status(200).send({ username });
};

module.exports = (app) => {
    app.post('/register', register);
    app.post('/login', login);
    app.put('/logout', logout);
};