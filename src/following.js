const following = {
    testUser: [],
};

const getFollowing = (req, res) => {
    res.status(200).send(following[req.username]);
};

module.exports = (app) => {
    app.get('/following', getFollowing);
};