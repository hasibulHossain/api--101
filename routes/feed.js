const express = require('express');
const feedController = require('../controller/feed');
const { body } = require('express-validator')

//local import
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

//  GET /feed/posts/
router.get('/posts', isAuth, feedController.getPosts);
router.get('/post/:postId', isAuth, feedController.getSinglePost);

// POST requrest
router.post('/post',
    // [
    //     body('title')
    //         .trim()
    //         .isLength({ min: 5 })
    //         .withMessage('title must be greater than 5 character'),

    //     body('content')
    //         .trim()
    //         .isLength({ min: 5 })
    //         .withMessage('content must be greater than 3 word')
    // ],
    isAuth,
    feedController.createPost
);

// PUT request
router.put('/post/:postId',
    [
        body('title')
            .trim()
            .isLength({ min: 5 })
            .withMessage('title must be greater than 5 character')
    ],
    isAuth,
    feedController.updatePost
)

// DELETE requrest

router.delete('/post/:postId', isAuth, feedController.deletePost);


module.exports = router;