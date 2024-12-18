const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    username: {
        type: String,
        unique: true,
        trim: true
    },
    headline: {
        type: String,
        default: 'A new RiceBook user'
    },
    email: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        default: '00000'
    },
    phone: {
        type: String,
        default: '000-000-0000'
    },
    dob: {
        type: Date,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for user's age
profileSchema.virtual('age').get(function () {
    return Math.floor((Date.now() - this.dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
