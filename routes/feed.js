const express = require('express');

const router = express.Router();

const { body } = require('express-validator');

const feedController = require('../controller/feed');

const isAuth = require('../controller/middleware/auth.js')
// GET posts /feed/posts
router.get('/posts',isAuth, feedController.getPosts);


//Create post 
/**
 * @description post router to create new post 
 */
router.post('/posts', isAuth,
    [
        body('title')
            .trim()
            .isLength({ min: 5 }),
        body('content')
            .trim()
            .isLength({ min: 5 })
    ],
    feedController.postPost);



//GETTING SINGLE POST
router.get('/post/:postId', isAuth, feedController.getPost);



// SIGN USER
//  EDITING SINGLE POST ,
router.put('/posts/:postId', isAuth, feedController.updatePost);
// DELETING SINGLE POST,
router.delete('/posts/:postId', isAuth, feedController.deletePost);
// VIEW STATUS OF USER,


module.exports = router;