const { validationResult } = require("express-validator");
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const User = require('../model/user');


exports.signUp = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    let error = validationResult(req);

    if (!error.isEmpty()) {
        console.log(error);
        res.status(300).json(error.array());
    }
    bcrypt.hash(password, 11)
        .then((hashPassword) => {
            let newUser = new User({
                name: name,
                email: email,
                password: hashPassword,
            });
            return newUser.save();
        })
        .then((user) => {
            console.log(user);
            res.status(201).json({message:'User saved successfully'});
        })
        .catch(err => {
            next(err);
    })
}

exports.signIn = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let error = validationResult(req);

    // if (!error.isEmpty) {
    //     throw error.array()[0];
    //     res.status(300).json(error.array());
    // }
    let foundUser;
    User.findOne({ email: email })
        .then((user) => {
            console.log(this);
            if (!user) {
                
                let error = new Error('user not found');
                error.statusCode = 401;
                throw error;
            }
            // console.log(this);
            foundUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then((result) => {
            console.log(result);
            if (!result) {
                const error = new Error('Wrong Password');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign({
                email: result.email,
                userId: foundUser._id.toString()
            }, 'abhishek',
                {
                expiresIn:'1h'
                });
            res.status(200).json(
                {
                    token: token,
                    userId: foundUser._id.toString()
                });
        }).catch((error) => { 
            console.log(error);
            next(error);
        })
}