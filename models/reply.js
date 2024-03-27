const mongoose = require('mongoose')

const replySchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    }
})

const Reply = mongoose.model('replies', replySchema)

module.exports = Reply