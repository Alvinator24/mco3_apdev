const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    replies: {
        type: String
    }
})

const Comment = mongoose.model('comments', commentSchema)

module.exports = Comment