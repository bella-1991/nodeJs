const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcryptjs');
const passport = require('passport');

// bring in User model
let User = require('../models/user');

// Register form
router.get('/register', function(req, res) {
    res.render('register');
});

// Register process
router.post('/register', function(req, res) {
    let user,
        errors;

    console.log(req.body.password);

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('confirm_password', 'Passwords do not match').equals(req.body.password);

    errors = req.validationErrors();

    // GEt Errors
    if (errors) {
        res.render('register', {
            errors: errors
        })
    } else {
        user  = new User();

        user.name = req.body.name;
        user.email = req.body.email;
        user.username = req.body.username;
        user.password = req.body.password;

        console.log(user)
    
        bcrypt.genSalt(10, function (error, salt) {
           bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) {
                    console.log(err);
                }
                console.log('error ' + err);
                console.log('hash ' + hash);
                user.password = hash;

                user.save(function(err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        req.flash('success', 'User added successfuly! You can now log in.');
                        res.redirect('/user/login');
                    }
                });
           });
        });
    }
});

// get login form
router.get('/login', function(req, res) {
    res.render('login');
});

// submit login form
router.post('/login', function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

// get logout
router.get('/logout', function(req, res) {
    res.render('logout');
    req.flash('success', 'You are logged out'); 
    res.redirect('/user/login');
});

module.exports = router;