require('dotenv').config();
const { validationResult } = require('express-validator');
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const errMessage = require('../util/errMss');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        const message = error.array()[0].msg;
        errMessage(message, 422)
    };

    bcryptjs.hash(password, 12)
        .then(hashPassword => {
            const user = new User({
                name: name,
                email: email,
                password: hashPassword
            })
            return user.save()
        })
        .then(user => {
            res.status(201).json({
                message: 'sign up successful', userId: user._id
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}

exports.signIn = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        const message = error.array()[0].msg;
        errMessage(message, 422)
    }
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                errMessage('One or more input incorrect', 401);
            }
            return bcryptjs.compare(password, user.password)
                .then(isValidPass => {
                    if (!isValidPass) {
                        errMessage('Password is not correct', 401);
                    }

                    const secret = process.env.ACCESS_TOKEN;

                    const token = jwt.sign(
                        { email: user.email, userId: user._id },
                        secret,
                        { expiresIn: '30m' }
                    )

                    res.status(200).json({
                        token: token, userId: user._id
                    })
                })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};