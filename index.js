const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// 初始化应用
const app = express();

// 中间件
app.use(bodyParser.json());
app.use(cookieParser());

// 路由
require('./src/auth.js')(app);
require('./src/articles.js')(app);
require('./src/profile.js')(app);
require('./src/following.js')(app);

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});