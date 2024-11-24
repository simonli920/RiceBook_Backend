// src/models.js

const mongoose = require('mongoose');

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    hash: String, // Password hash
});

const User = mongoose.model('User', userSchema);

// Profile Schema and Model
const profileSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    headline: String,
    email: String,
    zipcode: String,
    phone: String,
    dob: Date,
    avatar: String,
    following: [String],
});

const Profile = mongoose.model('Profile', profileSchema);

// Article Schema and Model
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

const Article = mongoose.model('Article', articleSchema);

module.exports = { User, Profile, Article };