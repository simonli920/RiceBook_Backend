const Profile = require('../models/Profile');
const { upload } = require('../utils/multer');

exports.getHeadline = async (req, res) => {
    const username = req.params.user || req.username;
    const profile = await Profile.findOne({ username });
    if (!profile) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ username, headline: profile.headline });
};

exports.updateHeadline = async (req, res) => {
    const username = req.username;
    const { headline } = req.body;
    await Profile.findOneAndUpdate({ username }, { headline });
    res.json({ username, headline });
};

exports.getEmail = async (req, res) => {
    const username = req.params.user || req.username;
    const profile = await Profile.findOne({ username });
    if (!profile) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ username, email: profile.email });
};

exports.updateEmail = async (req, res) => {
    const username = req.username;
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    await Profile.findOneAndUpdate({ username }, { email });
    res.json({ username, email });
};

exports.getZipcode = async (req, res) => {
    const username = req.params.user || req.username;
    const profile = await Profile.findOne({ username });
    if (!profile) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ username, zipcode: profile.zipcode });
};

exports.updateZipcode = async (req, res) => {
    const username = req.username;
    const { zipcode } = req.body;
    if (!zipcode) {
        return res.status(400).json({ message: 'Zipcode is required' });
    }
    await Profile.findOneAndUpdate({ username }, { zipcode });
    res.json({ username, zipcode });
};

exports.getPhone = async (req, res) => {
    const username = req.params.user || req.username;
    const profile = await Profile.findOne({ username });
    if (!profile) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ username, phone: profile.phone });
};

exports.updatePhone = async (req, res) => {
    const username = req.username;
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ message: 'Phone is required' });
    }
    await Profile.findOneAndUpdate({ username }, { phone });
    res.json({ username, phone });
};

exports.getDob = async (req, res) => {
    const profile = await Profile.findOne({ username: req.username });
    if (!profile) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ username: req.username, dob: profile.dob.getTime() });
};

exports.getAvatar = async (req, res) => {
    const username = req.params.user || req.username;
    const profile = await Profile.findOne({ username });
    if (!profile) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ username, avatar: profile.avatar });
};

exports.updateAvatar = async (req, res) => {
    const username = req.username;
    
    upload.single('avatar')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload failed' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const imageUrl = req.file.path;
            await Profile.findOneAndUpdate({ username }, { avatar: imageUrl });
            res.json({ username, avatar: imageUrl });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update avatar' });
        }
    });
}; 