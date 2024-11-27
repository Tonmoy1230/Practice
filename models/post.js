const mongoose = require('mongoose');
const ejs = require('ejs');
const os = require('os');

const postSchema = mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    date: {
        type: Date,
        default: Date.now
    },
    comment: String,
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    }]

})

module.exports = mongoose.model('post', postSchema);