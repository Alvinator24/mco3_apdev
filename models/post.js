const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    community: {
        type: String,
        required: true
    },
    upvotes: {
        type: Number,
        default: 0
    },
    author: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    isEdited: {
        type: Boolean,
        default: false
    }
})

const Post = mongoose.model('posts', postSchema)

module.exports = Post