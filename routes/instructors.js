var express = require('express');
var middleware = require('../middleware/index.js');
var Instructor = require('../models/instructor');
var moment = require('moment');

var router = express.Router();

// Home Route: Lists all instructors

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get("/instructors", function(req, res){
    
    if (req.query.search) {
        const searchText = new RegExp(escapeRegex(req.query.search), 'gi');
        
        Instructor.find({name: searchText}, function(err, instructors){
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            
            if (instructors.length === 0) {
                req.flash("error", "Opps, nothing seems to match you search...");
            }
            
            res.render("instructors/index.ejs", {instructors: instructors, currentUser: req.user});
        });
    } else {
    
        Instructor.find({}, function(err, instructors){
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            
            res.render("instructors/index.ejs", {instructors: instructors, currentUser: req.user});
        });
    }
});

// Create Routes: New Instructors

router.post("/instructors", function(req, res){
    let newInstructor = {
        name: req.body.name,
        image: req.body.image,
        department: req.body.department,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    };
    
    Instructor.create(newInstructor, function(err, instructor){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/instructors/new");
        }
        
        req.flash("success", "Successfully Added " + instructor.name);
        res.redirect("/instructors");
    });
});

router.get("/instructors/new", middleware.isLoggedIn, function(req, res){
    res.render("instructors/new.ejs");
});

// Show Route: Display Instructor Profile

router.get("/instructors/:instructor_id", function(req, res){
    Instructor.findById(req.params.instructor_id).populate('reviews').exec(function(err, instructor){
        if (err || !instructor) {
            req.flash("error", "Error: This instructor does not exist or has been removed.");
            return res.redirect("/instructors");
        }
        
        res.render("instructors/show.ejs", {instructor: instructor});
    });
});

// Edit Route: Requires Admin Previlage

router.get("/instructors/:instructor_id/edit", middleware.isAdmin, function(req, res){
    Instructor.findById(req.params.instructor_id, function(err, instructor){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/instructors/" + req.params.instructor_id);
        } else if (!instructor) {
            req.flash("error", "No such instructor");
            return res.redirect("/instructors");
        }
        
        res.render("instructors/edit.ejs", {instructor: instructor});
    });
});

// Update Edit Route: Requires Admin Previlage

router.put("/instructors/:instructor_id", middleware.isAdmin, function(req, res){
    let updatedInstructor = {
        name: req.body.name,
        image: req.body.image,
        department: req.body.department,
        rating: req.body.rating,
        amount: req.body.amount
    };
    
    Instructor.findByIdAndUpdate(req.params.instructor_id, updatedInstructor, function(err, instructor){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/instructors");
        }
        
        req.flash("success", "Successfully updated instructor");
        res.redirect("/instructors/" + req.params.instructor_id);
    });
});

// Delete Route: Requires Admin Previlage

router.delete("/instructors/instructor_id", middleware.isAdmin, function(req, res){
    Instructor.findByIdAndRemove(req.params.instructor_id, function(err){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/instructors");
        }
        
        req.flash("success", "Successfully deleted instructor");
        res.redirect("/instructors");
    });
});

module.exports = router;