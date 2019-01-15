var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    name: String,
    email: {type: String, unique: true, required: true},
    avatar: {type: String, default: "https://t4.ftcdn.net/jpg/02/12/14/09/240_F_212140955_Q9fljRsrQf9RRNughd43Csi6zWvJn5d4.jpg"},
    isAdmin: {type: Boolean, default: false},
    resetPasswordToken: String,
    resetPasswordExpires: Date
    
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);