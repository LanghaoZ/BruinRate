var mongoose = require('mongoose');

var ReviewSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        anonymity: {type: Boolean, default: false}
    },
    objective: {
        instructor: String,
        course: String,
        grade: String,
        quarter: String,
        year: String
    },
    rating: {
        overall: {type: Number, default: 0},
        difficulty: {type: Number, default: 0},
        workload: {type: Number, default: 0},
        easiness: {type: Number, default: 0},
        clarity: {type: Number, default: 0},
        helpfulness: {type: Number, default: 0},
        comment: String
    },
    date: String,
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor"
    }
});

module.exports = mongoose.model("Review", ReviewSchema);