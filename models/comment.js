const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    body: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String
    },
    upvotes: {
        type: Number,
        default: 0
    }
})

const Comment = mongoose.model('comments', commentSchema)

module.exports = Comment