// src/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    hash: String, // Password hash
});

module.exports = mongoose.model('User', userSchema);
