var express = require('express');
var moment = require('moment');
var bodyParser = require('body-parser');

var middleware = require('../middleware/index.js');
var Instructor = require('../models/instructor');
var Review = require('../models/review');
var User = require('../models/user');

var router = express.Router();
var app = express();

app.use(bodyParser.urlencoded({extended: true}));

// Create Router: New Review

router.get("/instructors/:instructor_id/reviews/new", middleware.isLoggedIn, function(req, res){
    Instructor.findById(req.params.instructor_id, function(err, instructor){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/instructors/" + req.params.instructor_id);
        }
        
        res.render("reviews/new.ejs", {instructor: instructor});
    });
});

router.post("/instructors/:instructor_id/reviews", middleware.isLoggedIn, function(req, res){
    
    Instructor.findById(req.params.instructor_id, function(err, instructor){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        } else if (!instructor) {
            req.flash("error", "No Such Instructor");
            return res.redirect("back");
        } else {
            let newObjective = {
                instructor: instructor.name,
                course: req.body.course,
                grade: req.body.grade,
                quarter: req.body.quarter,
                year: req.body.year
            };
            
            let newRating = {
                overall: Number(req.body.overall),
                difficulty: Number(req.body.difficulty),
                workload: Number(req.body.workload),
                clarity: Number(req.body.clarity),
                helpfulness: Number(req.body.helpfulness),
                comment: req.body.comments
            };
            
            let newAuthor = {
                id: req.user._id,
                username: req.user.username,
                anonymity: !!req.body.anonymity
            };
            
            let newReview = {
                author: newAuthor,
                objective: newObjective,
                rating: newRating,
                date: moment(new Date()).format('MM/DD/YYYY'),
                instructorId: instructor._id
            };
            
            Review.create(newReview, function(err, review){
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                
                instructor.reviews.push(review);
                
                let baseOverall = instructor.rating.overall * instructor.amount;
                let baseDifficulty = instructor.rating.difficulty * instructor.amount;
                let baseWorkload = instructor.rating.workload * instructor.amount;
                let baseClarity = instructor.rating.clarity * instructor.amount;
                let baseHelpfulness = instructor.rating.helpfulness * instructor.amount;
                
                instructor.amount = instructor.amount + 1;
                
                let newInstructorRating = {
                    overall: (baseOverall + newRating.overall) / instructor.amount,
                    difficulty: (baseDifficulty + newRating.difficulty) / instructor.amount,
                    workload: (baseWorkload + newRating.workload) / instructor.amount,
                    clarity: (baseClarity + newRating.clarity) / instructor.amount,
                    helpfulness: (baseHelpfulness + newRating.helpfulness) / instructor.amount
                };
                
                instructor.rating = newInstructorRating;
                instructor.save();
                
                req.flash("success", "Successfully Added Review!");
                res.redirect("/instructors/" + instructor._id);
            });
        }
    });
});

router.get("/instructors/:instructor_id/reviews/:review_id/edit", middleware.checkReviewOwnership, function(req, res){
    Instructor.findById(req.params.instructor_id, function(err, instructor){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        
        if (!instructor) {
            req.flash("error", "This instructor does not exist");
            return res.redirect("back");
        }
        
        Review.findById(req.params.review_id, function(err, review){
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            
            if (!review) {
                req.flash("error", "This review does not exist");
                return res.redirect("back");
            }
            
            res.render("reviews/edit.ejs", {review: review, instructor: instructor});
        });
    });
});

router.put("/instructors/:instructor_id/reviews/:review_id", middleware.checkReviewOwnership, function(req, res){
    Instructor.findById(req.params.instructor_id, function(err, instructor){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        
        if (!instructor) {
            req.flash("error", "This instructor does not exist");
            return res.redirect("back");
        }
        
        let updatedRating = {
                overall: Number(req.body.rating.overall),
                difficulty: Number(req.body.rating.difficulty),
                workload: Number(req.body.rating.workload),
                clarity: Number(req.body.rating.clarity),
                helpfulness: Number(req.body.rating.helpfulness),
                comment: req.body.comments
            };
            
        let updatedObjective = req.body.objective;
        updatedObjective.instructor = instructor.name;
        
        Review.findById(req.params.review_id, function(err, review){
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            
            if (!review) {
                req.flash("error", "This review does not exist");
                return res.redirect("back");
            }
            
            let oldRating = review.rating;
            let updatedAuthor = review.author;
            updatedAuthor.anonymity = !!req.body.anonymity;
            
            let amount = instructor.amount;
            
            let updatedInstructorRating = {
                overall: ((instructor.rating.overall * amount) - oldRating.overall + updatedRating.overall) / amount,
                difficulty: ((instructor.rating.difficulty * amount) - oldRating.difficulty + updatedRating.difficulty) / amount,
                workload: ((instructor.rating.workload * amount) - oldRating.workload + updatedRating.workload) / amount,
                clarity: ((instructor.rating.clarity * amount) - oldRating.clarity + updatedRating.clarity) / amount,
                helpfulness: ((instructor.rating.helpfulness * amount) - oldRating.helpfulness + updatedRating.helpfulness) / amount
            };
            
            review.rating = updatedRating;
            review.objective = updatedObjective;
            review.author = updatedAuthor;
            
            instructor.rating = updatedInstructorRating;
            
            review.save();
            instructor.save();
            
            res.redirect("/instructors/" + req.params.instructor_id);
        });
    });
});

router.delete("/instructors/:instructor_id/reviews/:review_id", middleware.checkReviewOwnership, function(req, res){
    Instructor.findById(req.params.instructor_id, function(err, instructor){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        
        if (!instructor) {
            req.flash("error", "This instructor does not exist");
            return res.redirect("back");
        }
        
        Review.findById(req.params.review_id, function(err, review){
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            
            if (!review) {
                req.flash("error", "This review does not exist");
                return res.redirect("back");
            }
            
            let oldRating = review.rating;
            let amount = instructor.amount;
            let newAmount = instructor.amount - 1;
            
            if (newAmount > 0) {
                let updatedInstructorRating = {
                    overall: ((instructor.rating.overall * amount) - oldRating.overall) / newAmount,
                    difficulty: ((instructor.rating.difficulty * amount) - oldRating.difficulty) / newAmount,
                    workload: ((instructor.rating.workload * amount) - oldRating.workload) / newAmount,
                    clarity: ((instructor.rating.clarity * amount) - oldRating.clarity) / newAmount,
                    helpfulness: ((instructor.rating.helpfulness * amount) - oldRating.helpfulness) / newAmount
                };
                
                instructor.amount = instructor.amount - 1;
                instructor.rating = updatedInstructorRating;
                instructor.save();
            } else {
                let updatedInstructorRating = {
                    overall: 0,
                    difficuly: 0,
                    workload: 0,
                    clarity: 0,
                    helpfulness: 0
                };
                
                instructor.amount = instructor.amount - 1;
                instructor.rating = updatedInstructorRating;
                instructor.save();
            }
            
            review.remove();
            
            res.redirect("/instructors/" + req.params.instructor_id);
        });
    });
});

module.exports = router;