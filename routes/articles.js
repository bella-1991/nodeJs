const express = require('express');
const router = express.Router(); 

// bring in Article model
let Article = require('../models/articles');
// bring in User model
let User = require('../models/user');

// Add route
router.get('/add', ensureAuthenticated, function(req, res) {
    res.render('add_article', {
        title: 'Add Article'
    })
});

// Add submit POST route
router.post('/add', function(req, res) {
    let article,
        errors;;

    req.checkBody('title', 'Title is required').notEmpty();
    //  req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    errors = req.validationErrors();

    // GEt Errors
    if (errors) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        })
    } else {
        article  = new Article();

        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
    
        article.save(function(err) {
            if (err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article added successfuly!');
                res.redirect('/');
            }
        });
    }
});

// Edit Single Article
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if (article.author != req.user._id) {
            req.flash('danger', 'Not authorised!');
            res.redirect('/');
        }
        res.render('edit_article', {
            title: 'Edit',
            article: article
        })
    })
});

// Update Single Article
router.post('/edit/:id', function(req, res) {
    let article = {};

    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    let query = {_id: req.params.id};

    Article.update(query, article, function(err) {
        if (err) {
            console.log(err);
            return;
        } else {
            req.flash('success', 'Article updated successfuly!');
            res.redirect('/');
        }
    });
});


// Get Single Article
router.get('/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        User.findById(article.author, function(err, user) {
            res.render('article', {
                article: article,
                author: user.name
            })
        });
    })
}); 

// Delete Article
router.delete('/:id', function(req, res) {
    let query = {_id: req.params.id};

    Article.remove(query, function(err) {
        if (err) {
            console.log(err);
        } 
        
        res.send('Success');
    })
});

// Access control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Access denied! Please login');
        res.redirect('/user/login');
    }
}

module.exports = router;