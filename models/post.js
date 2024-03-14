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
    upvotes: {
        type: Number,
        default: 5
    }
})

const Post = mongoose.model('posts', postSchema)

module.exports = Post