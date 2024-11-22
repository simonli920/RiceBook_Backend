// src/articles.js

const Article = require('./models/Article');
const { isLoggedIn } = require('./authMiddleware');

const getArticles = async (req, res) => {
    const articles = await Article.find({});
    res.status(200).send(articles);
};

const getArticleById = async (req, res) => {
    const article = await Article.findOne({ pid: req.params.id });
    if (!article) return res.status(404).send('Article not found');
    res.status(200).send(article);
};

const addArticle = async (req, res) => {
    const { text } = req.body;
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
    res.status(200).send(newArticle);
};

module.exports = (app) => {
    app.get('/articles', isLoggedIn, getArticles);
    app.get('/articles/:id', isLoggedIn, getArticleById);
    app.post('/article', isLoggedIn, addArticle);
};
