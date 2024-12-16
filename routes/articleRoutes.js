const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Profile = require('../models/Profile');
const { isLoggedIn } = require('../utils/middleware');

// Get articles (with pagination)
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get user's profile to get following list
        const userProfile = await Profile.findOne({ user: req.session.userId });
        const following = userProfile.following;

        // Get articles from user and following users
        const articles = await Article.find({
            author: { $in: [req.session.userId, ...following] }
        })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'username')
            .populate('comments.author', 'username');

        const total = await Article.countDocuments({
            author: { $in: [req.session.userId, ...following] }
        });

        res.json({
            articles,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalArticles: total
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching articles',
            error: error.message
        });
    }
});

// Get single article
router.get('/:id', isLoggedIn, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'username')
            .populate('comments.author', 'username');

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json(article);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching article',
            error: error.message
        });
    }
});

// Create article
router.post('/', isLoggedIn, async (req, res) => {
    try {
        const { text, image } = req.body;

        const article = new Article({
            author: req.session.userId,
            text,
            image
        });

        await article.save();

        const populatedArticle = await Article.findById(article._id)
            .populate('author', 'username');

        res.status(201).json(populatedArticle);
    } catch (error) {
        res.status(500).json({
            message: 'Error creating article',
            error: error.message
        });
    }
});

// Update article
router.put('/:id', isLoggedIn, async (req, res) => {
    try {
        const { text, image } = req.body;
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Check if user is the author
        if (article.author.toString() !== req.session.userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this article' });
        }

        article.text = text;
        if (image) article.image = image;
        
        await article.save();

        const updatedArticle = await Article.findById(article._id)
            .populate('author', 'username')
            .populate('comments.author', 'username');

        res.json(updatedArticle);
    } catch (error) {
        res.status(500).json({
            message: 'Error updating article',
            error: error.message
        });
    }
});

// Add comment
router.post('/:id/comments', isLoggedIn, async (req, res) => {
    try {
        const { text } = req.body;
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        article.comments.push({
            author: req.session.userId,
            text
        });

        await article.save();

        const updatedArticle = await Article.findById(article._id)
            .populate('author', 'username')
            .populate('comments.author', 'username');

        res.json(updatedArticle);
    } catch (error) {
        res.status(500).json({
            message: 'Error adding comment',
            error: error.message
        });
    }
});

module.exports = router;
