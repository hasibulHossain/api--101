require('dotenv').config();
const jwt = require('jsonwebtoken')
const errMessage = require('../util/errMss');


module.exports = (req, _, next) => {
    const authorization = req.headers['authorization'];
    const token = authorization && authorization.split(' ')[1];
    if (!token) {
        errMessage('Authorization header missing', 401)
    }
    const secret = process.env.ACCESS_TOKEN;

    jwt.verify(token, secret, (err, user) => {
        if (err) errMessage('unauthorized', 403);
        req.userId = user.userId;
        next();
    });
}