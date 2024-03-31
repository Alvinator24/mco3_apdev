const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const session = require('express-session')
require('dotenv').config()

const indexRouter = require('./controllers/index')
const userRouter = require('./controllers/users')

app.use(express.static('public'))
app.use('/uploads', express.static('uploads'))

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(methodOverride('_method'))

const mongoose = require('mongoose')
mongoose.connect(process.env.DB_CONN, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to MongoDB'))

const mongoStore = require('connect-mongodb-session')(session)

app.use(session({
    secret: 'secret key',
    saveUninitialized: true, 
    resave: false,
    store: new mongoStore({ 
      uri: process.env.DB_CONN,
      collection: 'sessions',
      expires: 1000*60*60 // 1 hour in seconds
    })
}))

app.use('/', indexRouter)
app.use('/users', userRouter)

app.listen(3000, () => {
    console.log('Listening to port 3000')
})