// src/articles.js

module.exports = (app, { Article }, { sessionUser, cookieKey }) => {
    const isLoggedIn = require('./auth.js').isLoggedIn;
    const { upload } = require('./multer.js');

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
                // 获取当前用户和关注者的文章，并分页
                const profile = await Profile.findOne({ username: req.username });
                const authors = [req.username, ...profile.following];

                const limit = parseInt(req.query.limit) || 10;
                const offset = parseInt(req.query.offset) || 0;

                const articles = await Article.find({ author: { $in: authors } })
                    .sort({ date: -1 })
                    .skip(offset)
                    .limit(limit);

                res.json({ articles });
            }
        } catch (err) {
            res.status(500).send(`Failed to get articles: ${err.message}`);
        }
    });

    // 创建新文章
    app.post('/article', isLoggedIn, upload.single('image'), async (req, res) => {
        try {
            const { text } = req.body;
            const imageUrl = req.file ? req.file.path : null;

            if (!text && !imageUrl) {
                return res.status(400).send('Article content cannot be empty');
            }

            // 获取最新的 pid
            const lastArticle = await Article.findOne().sort({ pid: -1 });
            const newPid = (lastArticle?.pid || 0) + 1;

            const newArticle = new Article({
                pid: newPid,
                author: req.username,
                text,
                image: imageUrl,
                date: new Date(),
                comments: []
            });

            await newArticle.save();
            res.json({ articles: [newArticle] });
        } catch (err) {
            res.status(500).send(`Failed to create article: ${err.message}`);
        }
    });

    // 更新文章或添加/编辑评论
    app.put('/articles/:id', isLoggedIn, async (req, res) => {
        try {
            const { id } = req.params;
            const { text, commentId } = req.body;

            if (!text) {
                return res.status(400).send('Content cannot be empty');
            }

            const article = await Article.findOne({ pid: parseInt(id) });
            if (!article) {
                return res.status(404).send('Article not found');
            }

            if (commentId === undefined) {
                // 更新文章内容
                if (article.author !== req.username) {
                    return res.status(403).send('No permission to modify others\' article');
                }
                article.text = text;
            } else if (commentId === -1) {
                // 添加新评论（已在上一步实现）
            } else {
                // 编辑评论
                const comment = article.comments.find(c => c.commentId === commentId);
                if (!comment) {
                    return res.status(404).send('Comment not found');
                }
                if (comment.author !== req.username) {
                    return res.status(403).send('No permission to modify others\' comment');
                }
                comment.text = text;
                comment.date = new Date();
            }

            await article.save();
            res.json({ articles: [article] });
        } catch (err) {
            res.status(500).send(`Failed to update article: ${err.message}`);
        }
    });
}