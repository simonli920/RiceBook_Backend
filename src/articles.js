// src/articles.js

module.exports = (app, { Article }, { sessionUser, cookieKey }) => {
    const isLoggedIn = require('./auth.js').isLoggedIn;

    // 合并 GET /articles 和 GET /articles/:id 为一个端点
    app.get('/articles/:id?', isLoggedIn, async (req, res) => {
        try {
            const { id } = req.params;
            if (id) {
                // 获取特定文章
                const article = await Article.findOne({ pid: parseInt(id) });
                if (!article) {
                    return res.status(404).send('Article not found');
                }
                return res.json({ articles: [article] });
            } else {
                // 获取所有文章
                const articles = await Article.find({}).sort({ date: -1 });
                res.json({ articles });
            }
        } catch (err) {
            res.status(500).send(`获取文章失败: ${err.message}`);
        }
    });

    // 创建新文章
    app.post('/article', isLoggedIn, async (req, res) => {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).send('文章内容不能为空');
            }

            // 获取最新的 pid
            const lastArticle = await Article.findOne().sort({ pid: -1 });
            const newPid = (lastArticle?.pid || 0) + 1;

            const newArticle = new Article({
                pid: newPid,
                author: req.username,
                text,
                date: new Date(),
                comments: []
            });

            await newArticle.save();
            res.json({ articles: [newArticle] });
        } catch (err) {
            res.status(500).send(`创建文章失败: ${err.message}`);
        }
    });

    // 更新文章
    app.put('/articles/:id', isLoggedIn, async (req, res) => {
        try {
            const { id } = req.params;
            const { text } = req.body;
            
            if (!text) {
                return res.status(400).send('文章内容不能为空');
            }

            const article = await Article.findOne({ pid: parseInt(id) });
            if (!article) {
                return res.status(404).send('文章未找到');
            }

            if (article.author !== req.username) {
                return res.status(403).send('无权修改他人文章');
            }

            article.text = text;
            await article.save();
            res.json({ articles: [article] });
        } catch (err) {
            res.status(500).send(`更新文章失败: ${err.message}`);
        }
    });
}