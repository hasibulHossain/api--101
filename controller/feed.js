const { validationResult } = require('express-validator');

// local import
const dltImage = require('../util/dltImage');
const errMessage = require('../util/errMss');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
    const currentPage = +req.query.page || 1;
    const perPage = 2;
    let totalItems;

    Post.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find().skip((currentPage - 1) * perPage).limit(perPage);
        })
        .then(posts => {
            res.status(200).json({
                message: 'post fetch successfully',
                posts: posts,
                totalItems: totalItems
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}

exports.getSinglePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            res.status(200).json({
                post: post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    const file = req.file;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const message = error.array()[0].msg;
        errMessage(message, 422);
    }

    if (!file) {
        const err = new Error('image should be provided');
        err.statusCode = 422;
        throw err;
    }

    const post = new Post({
        title: title,
        content: content,
        imageUrl: file.path.split('uploads')[1],
        author: req.userId
    });

    post.save()
        .then(post => {
            if (!post) {
                errMessage('Post could not found!', 404);
            }

            User.findById(req.userId)
                .then(user => {
                    user.posts.push(post._id);
                    return user.save();
                })
                .then(user => {
                    res.status(201).json({
                        message: 'post created successfully',
                        post: post,
                        author: { _id: user._id, name: user.name }
                    })
                })
        })
        .catch(err => {
            if (!err.statusCode) {
                error.statusCode = 500;
            }
            next(err)
        })
}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    const file = req.file;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const message = error.array()[0].msg;
        errMessage(message, 422);
    }

    if (file) {
        imageUrl = file.path.split('uploads')[1];
    }

    if (!imageUrl) {
        errMessage('Image should be provided!', 422);
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                errMessage('Post could not found', 404);
            }

            if (imageUrl !== post.imageUrl) {
                dltImage(post.imageUrl);
            }

            if (post.author.toString() !== req.userId.toString()) {
                errMessage('Not authorized', 403);
            }

            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;

            return post.save()
        })
        .then(updatedPost => {
            res.status(200).json({
                message: 'post updated successfully', post: updatedPost
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                error.statusCode = 500;
            }
            next(err)
        });
}


exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    // async/await implementation. But got UnhandledPromiseRejectionWarning error
    // try {
    //     const post = await Post.findById(postId);
    //     if (!post) {
    //         errMessage('post could not found.', 404);
    //     };

    //     if (post.author.toString() !== req.userId.toString()) {
    //         errMessage('Not authorized', 403);
    //     };

    //     const result = await post.delete();
    //     res.status(200).json({
    //         message: 'post successfully deleted.'
    //     });
    //     dltImage(result.imageUrl);

    // } catch (error) {
    //     if (!error.statusCode) {
    //         error.statusCode = 500;
    //     }
    //     throw error
    // }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                return res.status(404).json({
                    message: 'post could not found'
                })
            }

            if (post.author.toString() !== req.userId.toString()) {
                errMessage('Not authorized', 403);
            }
            dltImage(post.imageUrl);
            return post.delete();
        })
        .then(_ => {
            return User.findById(req.userId)
        })
        .then(user => {
            user.posts.pull(postId); // for deleting deleted post id from author posts array
            return user.save();
        })
        .then(_ => {
            res.status(200).json({
                message: 'post successfully deleted.'
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}
















