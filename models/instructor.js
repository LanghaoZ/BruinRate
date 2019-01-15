var mongoose = require('mongoose');

var InstructorSchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true},
    image: String, //"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
    department: String,
    amount: {type: Number, default: 0},
    rating: {
        overall: {type: Number, default: 0},
        difficulty: {type: Number, default: 0},
        workload: {type: Number, default: 0},
        clarity: {type: Number, default: 0},
        helpfulness: {type: Number, default: 0}
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

module.exports = mongoose.model("Instructor", InstructorSchema);