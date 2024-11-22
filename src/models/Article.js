// src/models/Article.js

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    commentId: Number,
    author: String,
    text: String,
    date: Date,
});

const articleSchema = new mongoose.Schema({
    pid: Number,
    author: String,
    text: String,
    date: Date,
    comments: [commentSchema],
});

module.exports = mongoose.model('Article', articleSchema);
