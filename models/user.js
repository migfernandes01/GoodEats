const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

//define User Schema
const UserSchema = new Schema({
    email:{
        type: String,
        required: [true, 'e-mail is required'],
        unique: true
    }
});

//use passport for User Schema
UserSchema.plugin(passportLocalMongoose);   //going to add username and pw to schema

//create and export User model
module.exports = mongoose.model('User', UserSchema);