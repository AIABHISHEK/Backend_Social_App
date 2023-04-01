const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const Post = require('../model/post');
const User = require('../model/user');
const io = require('../socket.js');

// get all the posts
exports.getPosts = (req, res, next) => {
    console.log("llkk");
    let pageNumber = req.query.page || 1;
    let postsPage = 2;
    let numberOfPosts;
    Post.find()
        .countDocuments()
        .then((count) => {
            numberOfPosts = count;
            return Post.find()
                .populate('creator')
                .skip((pageNumber - 1) * postsPage)
                .limit(postsPage)
        })
        .then((posts) => {
            console.log(posts);
            res.status(200).json({
                message: 'post fetched',
                posts: posts,
                totalItems: numberOfPosts
            });
            // }
        }).catch((err) => {
            // throw new Error('Could not find posts');
            // console.log(err);
            next(err);
        })
}
///create post
exports.postPost = (req, res, next) => {
    // console.log("jjkdfjkgdg");
    const error = validationResult(req);

    if (!error.isEmpty()) {
        const error = new Error('validation failed')
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('no image ')
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path.replace("\\", "/");
    const title = req.body.title;
    const content = req.body.content;
    // console.log("jjkdfjkgdg");
    // console.log("hello");
    // console.log(imageUrl);
    console.log("jjkdfjkgdg");
    let newPost = new Post({
        title: title,
        content: content,
        creator: req.userId,
        // createdAt will be automatically created
        imageUrl: imageUrl
    });

    newPost
        .save()
        .then((post) => {
            
            return User.findById(req.userId);
        })
        .then((user) => {
            user.posts.push(newPost);
            return user.save();
        }
        )
        .then((user) => {
            console.log("post created");
            io.getIo().emit('posts', {/**data to send */
                action: "post",
                post: {...newPost._doc, creator:{id: user._id, name:user.name}}
        
            })
            res.status(200).json({
                message: "post created",
                post: newPost,
                creator: {id: user._id, name:user.name}
            }
            );
        })
        .catch(err => {
            // console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
    // create post and and store in database

}

/// get single post

exports.getPost = (req, res, next) => {
    // let Post;
    let id = req.params.postId;
    console.log("this to get single post");

    Post.findById(id)
        .then((post) => {
            // if (posts) {
            // Posts = posts;
            console.log(post);
            res.status(200).json({
                post: post
            });
            // }
        }).catch((err) => {
            // throw new Error('Could not find post');
            console.log(err);
            next(err);
        })
}


exports.updatePost = (req, res, next) => {
    let id = req.params.postId;
    const error = validationResult(req);
    console.log("updated");
    if (!error.isEmpty()) {
        const error = new Error('validation failed')
        error.statusCode = 422;
        throw error;
    }
    let imageUrl;
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }

    const title = req.body.title;
    const content = req.body.content;
    // console.log("hello");
    console.log(imageUrl);

    Post.findById(id)
        .then((post) => {
            if (post.creator.toString() !== req.userId) {
                let err = new Error('Not authorized');
                err.statusCode = 403;
                throw err;
            }
            if (imageUrl !== undefined)
                removeImage(post.imageUrl);
            console.log(post);
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl ? imageUrl : post.imageUrl;
            return post.save();
        })
        .then((postUpdated) => {
            res.status(200).json({
                message: "post created",
                post: postUpdated
            }
            );
        }).catch((err) => {
            console.log(err);
            let errs = new Error("failed to update");
            next(errs);
        })
}


exports.deletePost = (req, res, next) => {
    const id = req.params.postId;
    console.log(id);
    Post.findById(id)
        .then((post) => {
            if (post.creator.toString() !== req.userId) {
                let err = new Error('Not authorized');
                err.statusCode = 403;
                throw err;
            }
            // check user
            removeImage(post.imageUrl);
            return Post.findByIdAndRemove(id)
        })
        .then((result) => {
            return User.findById(req.userId);
        })
        .then((user) => {
            user.posts.pull(id);
            return user.save();
        })
        .then((result) => {
            res.status(200).json({
                message: "post deleted",
            }
            );
        })
        .catch(err => {
            next(err);
        })
}




const removeImage = (imageUrl) => {
    fs.unlink(path.join(__dirname, '..', imageUrl), (err) => {
        console.log(err);
    })
}