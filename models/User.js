const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId;
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Google OAuth fields
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    displayName: String
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to validate password
userSchema.methods.validatePassword = async function (password) {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
};

// Method to link Google account
userSchema.methods.linkGoogleAccount = function(googleId, email, displayName) {
    this.googleId = googleId;
    this.email = email;
    this.displayName = displayName;
};

// Method to unlink Google account
userSchema.methods.unlinkGoogleAccount = function() {
    this.googleId = undefined;
    this.displayName = undefined;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
