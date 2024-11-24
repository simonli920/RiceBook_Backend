// src/articles.js

module.exports = (app, models, session) => {
    const { isLoggedIn } = require('./authMiddleware')(session.sessionUser, session.cookieKey);
    const { Article, Profile } = models;

    const getArticles = async (req, res) => {
        const id = req.params.id;
        let articles;

        if (!id) {
            // Return articles from the logged-in user's feed
            const profile = await Profile.findOne({ username: req.username });
            const authors = [req.username, ...profile.following];
            articles = await Article.find({ author: { $in: authors } });
        } else {
            if (isNaN(id)) {
                // id is a username
                articles = await Article.find({ author: id });
            } else {
                // id is a post id (pid)
                const article = await Article.findOne({ pid: id });
                if (!article) {
                    return res.status(404).send('Article not found');
                }
                articles = [article];
            }
        }

        res.status(200).send({ articles });
    };

    const addArticle = async (req, res) => {
        const { text } = req.body;
        if (!text) {
            return res.status(400).send('Missing text');
        }

        const count = await Article.countDocuments({});
        const pid = count + 1;

        const newArticle = new Article({
            pid,
            author: req.username,
            text,
            date: new Date(),
            comments: [],
        });

        await newArticle.save();
        res.status(200).send({ articles: [newArticle] });
    };

    const updateArticle = async (req, res) => {
        const articleId = req.params.id;
        const { text, commentId } = req.body;

        if (!text) {
            return res.status(400).send('Missing text');
        }

        const article = await Article.findOne({ pid: articleId });
        if (!article) {
            return res.status(404).send('Article not found');
        }

        if (!commentId) {
            // Update the article text
            if (article.author !== req.username) {
                return res.status(403).send('Forbidden: Cannot edit others\' articles');
            }

            article.text = text;
            await article.save();
            res.status(200).send({ articles: [article] });
        } else if (commentId === -1) {
            // Add a new comment
            const newCommentId = article.comments.length + 1;
            article.comments.push({
                commentId: newCommentId,
                author: req.username,
                text,
                date: new Date(),
            });
            await article.save();
            res.status(200).send({ articles: [article] });
        } else {
            // Update existing comment
            const comment = article.comments.find(c => c.commentId === commentId);
            if (!comment) {
                return res.status(404).send('Comment not found');
            }

            if (comment.author !== req.username) {
                return res.status(403).send('Forbidden: Cannot edit others\' comments');
            }

            comment.text = text;
            comment.date = new Date();
            await article.save();
            res.status(200).send({ articles: [article] });
        }
    };

    app.get('/articles/:id?', isLoggedIn, getArticles);
    app.put('/articles/:id', isLoggedIn, updateArticle);
    app.post('/article', isLoggedIn, addArticle);
};