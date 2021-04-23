const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/databse');

mongoose.connect(config.database);
let db = mongoose.connection;

// check connection 
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// check for db errors
db.on('error', function(err) {
    console.log(err);
});

// init app
const app = express(); 

// bring in models
let Article = require('./models/articles');

// load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//parse application/json
app.use(bodyParser.json());

// set Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session middleware
app.use(session({
    secret: 'Keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Passport Config
require('./config/passport')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

// Home route
app.get('/', function(req, res) {
    Article.find({}, function(err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

// Route Files
let articles = require('./routes/articles');
app.use('/articles', articles); 

let user = require('./routes/user');
app.use('/user', user); 

// start server
app.listen(3000, function() {
    console.log('server started on port 3000...');
})