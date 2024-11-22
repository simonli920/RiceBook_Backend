// src/models/Profile.js

const mongoose = require('mongoose');

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

module.exports = mongoose.model('Profile', profileSchema);
