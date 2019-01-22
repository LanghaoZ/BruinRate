var express = require('express');
var router = express.Router();
var passport = require('passport');
var asy = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

var User = require('../models/user');
var Instructor = require('../models/instructor');

// The main route

router.get("/", function(req, res){
    res.render("home.ejs");
});

// Register: CREATE ROUTE

router.get("/register", function(req, res){
    res.render("users/register.ejs");
});

router.post("/register", function(req, res){
    let newUser = {
        username: req.body.username,
        name: req.body.fullname,
        email: req.body.email,
        avatar: req.body.avatar
    };
    
    User.register(newUser, req.body.password, function(err, user){
        if (err) {
            req.flash("error", err.message);
            return res.render("users/register.ejs");
        }
        
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to BruinRate, " + user.username + "!");
            res.redirect("/instructors"); // could be /landing
        })
    });
});

// Login/Logout Routes

router.get("/login", function(req, res){
    res.render("users/login.ejs");
});

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully Logged Out!");
    res.redirect("/instructors");
});

router.post("/login", passport.authenticate("local", {successRedirect: "/instructors", failureRedirect: "/login"}), function(req, res){
    
});

// Password Reset - could be in a separate route password.js

// User Show Page - could be in a separate route user.js

module.exports = router;