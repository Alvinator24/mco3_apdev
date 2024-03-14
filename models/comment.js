const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    }
})

const Comment = mongoose.model('comments', commentSchema)

module.exports = Comment