const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const session = require('express-session')

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

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(methodOverride('_method'))

const mongoose = require('mongoose')
const mongURI = 'mongodb+srv://vinator:apdev123@cluster0.l7spucv.mongodb.net/apdev'
mongoose.connect(mongURI)
const db = mongoose.connection
db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to MongoDB'))

const mongoStore = require('connect-mongodb-session')(session);

app.use(session({
    secret: 'secret key',
    saveUninitialized: true, 
    resave: false,
    store: new mongoStore({ 
      uri: mongURI,
      collection: 'sessions',
      expires: 1000*60*60 // 1 hour
    })
  }));

app.use('/', indexRouter)
app.use('/users', userRouter)
app.use('/posts', postRouter)
app.use('/comments', commentRouter)

app.listen(3000, () => {
    console.log('Listening to port 3000')
})