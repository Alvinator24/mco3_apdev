const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new mongoose.Schema({
    lastname: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobilenumber: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    }
})

userSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(saltRounds)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        this.confirmpassword = hashedPassword
        next()
    } catch (error) {
        next(error)
    }
})

const user = mongoose.model('users', userSchema)

module.exports = user