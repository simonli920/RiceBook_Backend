const Article = require('../models/Article');
const mongoose = require('mongoose');

exports.getArticles = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const user = req.user.username;
  const following = req.user.profile.following;
  const authors = [user, ...following];
  const articles = await Article.find({ author: { $in: authors } })
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ articles });
};

exports.getArticleById = async (req, res) => {
  const articleId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    return res.status(400).json({ message: 'Invalid article ID' });
  }
  const article = await Article.findById(articleId);
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  res.json({ article });
};

exports.createArticle = async (req, res) => {
  const { text } = req.body;
  const author = req.user.username;
  const article = new Article({
    author,
    text,
    date: new Date(),
    comments: [],
  });
  await article.save();
  res.status(201).json({ message: 'Article created', article });
};

exports.updateArticle = async (req, res) => {
  const { text, commentId } = req.body;
  const articleId = req.params.id;
  const username = req.user.username;

  const article = await Article.findById(articleId);
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  if (commentId) {
    // 更新评论
    const comment = article.comments.id(commentId);
    if (comment && comment.author === username) {
      comment.text = text;
      comment.date = new Date();
    } else {
      return res.status(403).json({ message: 'Unauthorized to edit this comment' });
    }
  } else {
    // 更新文章
    if (article.author === username) {
      article.text = text;
      article.date = new Date();
    } else {
      return res.status(403).json({ message: 'Unauthorized to edit this article' });
    }
  }
  await article.save();
  res.json({ message: 'Article updated', article });
}; 