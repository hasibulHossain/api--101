// packages
const express = require('express');
const authController = require('../controller/auth');
const { body } = require('express-validator');

// local import
const User = require('../models/user');

const router = express.Router();

router.put('/signup', [
    body("name", "invalid user name")
        .trim()
        .not()
        .isEmpty(),

    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage('please input a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(emailExist => {
                console.log('eeeeeeeeeee =>', emailExist)
                if (emailExist) {
                    return Promise.reject('this email address already exist');
                }
            })
        }),

    body("password", "password must be greater than 5 character")
        .trim()
        .isAlphanumeric()
        .isLength({ min: 5, max: 12 })
], authController.signup)

router.post('/login', [
    // body("email")
    //     .isEmail()
    //     .normalizeEmail()
    //     .withMessage('please input a valid email')
    //     .custom((value, { req }) => {
    //         return User.findOne({ email: value }).then(user => {
    //             if (!user) {
    //                 return Promise.reject('One or more details are incorrect')
    //             }
    //         })
    //     }),

    body("password", 'password must be greater than 5 character')
        .trim()
        .isAlphanumeric()
        .isLength({ min: 5 })
], authController.signIn);

module.exports = router;
