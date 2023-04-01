
const express = require('express');

const router = express.Router();

const { body } = require('express-validator');

const authController = require('../controller/auth');

router.put('/signup',
    [
        body('name')
            .trim()
            .isLength({ min: 2 })
            .withMessage('Name must be at least two character'),
        body('email')
            .isEmail()
            .withMessage('Please enter valid email'),
        body('password')
            .isLength(2)
            .withMessage('Password must be at least five character')
    ],
    authController.signUp);

    router.post('/login', authController.signIn)

module.exports = router;
