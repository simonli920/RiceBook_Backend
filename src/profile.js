const profile = {
    username: 'testUser',
    headline: 'Hello!',
    email: 'test@test.com',
    zipcode: '12345',
    phone: '123-456-7890',
};

const getHeadline = (req, res) => {
    res.status(200).send({ username: profile.username, headline: profile.headline });
};

const updateHeadline = (req, res) => {
    profile.headline = req.body.headline;
    res.status(200).send({ username: profile.username, headline: profile.headline });
};

module.exports = (app) => {
    app.get('/headline', getHeadline);
    app.put('/headline', updateHeadline);
};