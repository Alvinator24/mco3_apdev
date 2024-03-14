const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

// const bodyParser = require('body-parser')

const indexRouter = require('./controllers/index')
const userRouter = require('./controllers/users')
const postRouter = require('./controllers/posts')
const commentRouter = require('./controllers/comments')

app.use(express.static('public'))

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://vinator:apdev123@cluster0.l7spucv.mongodb.net/apdev')
const db = mongoose.connection
db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to MongoDB'))

app.use('/', indexRouter)
app.use('/users', userRouter)
app.use('/posts', postRouter)
app.use('/comments', commentRouter)

app.listen(3000, () => {
    console.log('Listening to port 3000')
})