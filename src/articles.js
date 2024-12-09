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
            res.status(500).send(`Failed to get article: ${err.message}`);
        }
    });

    // 创建新文章
    app.post('/article', isLoggedIn, async (req, res) => {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).send('Article content cannot be empty');
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
            res.status(500).send(`Failed to create article: ${err.message}`);
        }
    });

    // 更新文章
    app.put('/articles/:id', isLoggedIn, async (req, res) => {
        try {
            const { id } = req.params;
            const { text } = req.body;
            
            if (!text) {
                return res.status(400).send('Article content cannot be empty');
            }

            const article = await Article.findOne({ pid: parseInt(id) });
            if (!article) {
                return res.status(404).send('Article not found');
            }

            if (article.author !== req.username) {
                return res.status(403).send('No permission to modify others article');
            }

            article.text = text;
            await article.save();
            res.json({ articles: [article] });
        } catch (err) {
            res.status(500).send(`Failed to update article: ${err.message}`);
        }
    });
}