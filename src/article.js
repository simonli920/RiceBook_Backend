const articles = [];

const getArticles = (req, res) => {
    res.status(200).send(articles);
};

const getArticleById = (req, res) => {
    const article = articles.find((a) => a.pid === +req.params.id);
    if (!article) return res.status(404).send('Article not found');
    res.status(200).send(article);
};

const addArticle = (req, res) => {
    const { text } = req.body;
    const pid = articles.length + 1;
    const article = { pid, author: req.username, text, date: new Date(), comments: [] };
    articles.push(article);
    res.status(200).send(article);
};

module.exports = (app) => {
    app.get('/articles', getArticles);
    app.get('/articles/:id', getArticleById);
    app.post('/article', addArticle);
};