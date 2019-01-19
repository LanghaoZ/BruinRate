require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var localStrategy = require('passport-local');
var methodOverride = require('method-override');
var flash = require('connect-flash');

var app = express();

mongoose.connect(process.env.DATABASELOCATION, {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());

// Building Database Models

var Instructor = require('./models/instructor');
var Review = require('./models/review');
var User = require('./models/user');

// Passport Configuration

app.use(require('express-session')({
    secret: "Man Eggert is hard",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Globals Configuration

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Routing Configuration

var instructorRoutes = require('./routes/instructors');
var reviewRoutes = require('./routes/reviews');
var indexRoutes = require('./routes/index');
var userRoutes = require('./routes/users');

app.use(indexRoutes);
app.use(instructorRoutes);
app.use(reviewRoutes);
app.use(userRoutes);

// The BruinRate Server

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Starting the BruinRate server...");
});
