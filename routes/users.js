var express = require('express');
var nodemailer = require('nodemailer');
var asy = require('async');
var crypto = require('crypto');
var User = require('../models/user');

var router = express.Router();

router.get("/forgot", function(req, res){
    res.render("users/forgot.ejs");
});

router.post("/forgot", function(req, res, next){
    
    asy.waterfall([
        
    function(done) {
        
        crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
        });
    },
    
    function(token, done) {
        
        User.findOne({ email: req.body.email }, function(err, user) {
            
            if (err) {
                req.flash("error", err.message);
                return res.redirect("/forgot");
            }
            
            if (!user) {
                req.flash('error', 'This email address does not associate with any account');
                return res.redirect("/forgot");
            }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
            done(err, token, user);
        });
      });
    },
    
    function(token, user, done) {
        
        var smtpTransport = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
                user: 'bruinrate@gmail.com',
                pass: process.env.GMAILPW
            }
        });
        
        var mailOptions = {
            to: user.email,
            from: 'bruinrate@gmail.com',
            subject: 'BruinRate Password Reset',
            text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please discard this email and your password will remain unchanged.\n'
        };
        
        smtpTransport.sendMail(mailOptions, function(err) {
            console.log('mail sent');
            req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
            done(err, 'done');
        });
    }
    
  ], function(err) {
      if (err) return next(err);
      res.redirect("/forgot");
  });
    
});

router.get("/reset/:token", function(req, res){
    
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/forgot");
        }
        
        if (!user) {
            req.flash("error", "Password reset is invalid or has expired");
            return res.redirect("/forgot");
        }
        
        res.render("users/reset.ejs", {token: req.params.token});
    });
});

router.post("/reset/:token", function(req, res){
    
    asy.waterfall([
        
        function(done) {
            
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                        
                        if (err) {
                            req.flash("error", err.message);
                            return res.redirect("back");
                        }
                        
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err) {
                            
                            if (err) {
                                req.flash("error", err.message);
                                return res.redirect("back");
                            }
                            
                            req.logIn(user, function(err) {
                            done(err, user);
                            
                            });
                        });
                    });
                    
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                  user: 'bruinrate@gmail.com',
                  pass: process.env.GMAILPW
                }
            });
            
            var mailOptions = {
                to: user.email,
                from: 'bruinrate@mail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                  'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
              };
              
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
        
  ], function(err) {
      if (err) {
          req.flash("error", err.message);
          return res.redirect("back");
      }
      
      res.redirect("/instructors");
  });
});

module.exports = router