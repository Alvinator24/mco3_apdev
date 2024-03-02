const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
})

const Post = mongoose.model('posts', postSchema)

module.exports = Post