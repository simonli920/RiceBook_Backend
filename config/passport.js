const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Profile = require('../models/Profile');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }

        // Check if user exists with this email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // If user exists, link Google account
            user.linkGoogleAccount(profile.id, profile.emails[0].value, profile.displayName);
            await user.save();
            return done(null, user);
        }

        // Create new user
        user = new User({
            username: `google_${profile.id}`,
            email: profile.emails[0].value,
            googleId: profile.id,
            displayName: profile.displayName
        });
        await user.save();

        // Create associated profile after user is saved
        const userProfile = new Profile({
            user: user._id,
            username: user.username,
            email: user.email,
            dob: new Date(), // Default date
            headline: `Welcome ${user.displayName}!`,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.username}`
        });
        await userProfile.save();

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

module.exports = passport;