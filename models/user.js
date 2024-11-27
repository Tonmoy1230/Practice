const mongoose = require('mongoose');
const ejs = require('ejs');
const os = require('os');

mongoose.connect('mongodb://localhost:27017/textPublic');
const userSchema = mongoose.Schema({
    name: String,
    age: Number,
    username: String,
    email: String,
    password: String,
    post:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    }]
})

module.exports = mongoose.model('user', userSchema);