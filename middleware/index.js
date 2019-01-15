var Instructor = require('../models/instructor');
var Review = require('../models/review');
var User = require('../models/user')
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    
    req.flash("error", "Please log in first!");
    res.redirect("/login");
};

middlewareObj.isAdmin = function(req, res, next) {
   if (req.isAuthenticated()) {
       User.findById(req.user._id, function(err, foundUser){
           if (err) {
               req.flash("error", "Permission denied: Not a valid user.");
               return res.redirect("/instructors");
           }
           
           if (foundUser.isAdmin) {
               next();
           } else {
               req.flash("error", "Permission denied");
               return res.redirect("/instructors");
           }
       });
   } else {
       req.flash("error", "Permission denied");
       return res.redirect("/instructors");
   }
};

middlewareObj.checkReviewOwnership = function(req, res, next){
    if (req.isAuthenticated()) {
        Review.findById(req.params.review_id, function(err, review){
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            
            if (!review) {
                req.flash("error", "Review not found");
                return res.redirect("back");
            }
            
            if (review.author.id.equals(req.user._id)) {
                return next();
            }
            
            req.flash("error", "Permission denied");
            return res.redirect("back");
        });
    } else {
        req.flash("error", "Please login first!");
        res.redirect("/login");
    }
};

module.exports = middlewareObj;