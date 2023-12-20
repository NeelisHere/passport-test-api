const express = require('express')
const cors = require('cors')
const session = require('express-session');
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
// const cookieSession = require('cookie-session')
const logger = require('./logger');
const passport = require('passport')
const MongoStore = require('connect-mongo')(session);
const connectDB = require('./connectMongo')
const checkAuthenticated = require('./middlewares/authMiddleware')
require('dotenv').config();
require('./passport/googleStrategy')

const PORT = process.env.PORT || 8000
connectDB()
// const MongoStore = new connectMongo(session);
const app = express()
app.use(cors({
    origin: [process.env.LOCAL_FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.set('trust proxy', 1)
app.use(session({
    name: 'auth-token',
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: {
        // secure: false,
        maxAge: 60 * 1000,
        // sameSite: 'None'
    },
    store: new MongoStore({
        url: process.env.MONGO_URI,
        mongooseConnection: mongoose.connection,
        collection: 'sessions',
        autoRemove: 'native',
    })
}))

app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated, (req, res) => {
    console.log(req.user)
    res.json({
        success: true,
        message: 'Auth successful!',
        user: req.user ? req.user : null
    })
})

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/google/failure'
    }),
    (req, res) => {
        // console.log(req.user, req.isAuthenticated(), req.session)
        console.log('Auth successful...')
        res.redirect(`${process.env.LOCAL_FRONTEND_URL}`)
    }
);

app.get('/auth/google/failure', (req, res) => {
    res.json({
        success: false,
        message: 'Auth failed!'
    })
})

app.get('/auth/logout', (req, res) => {
    req.session = null
    req.logout((err) => {
        if (err) {
            console.log(err);
            res.status(401).json({
                success: false,
                message: 'Logout failed!'
            })
        } else {
            res.cookie('auth-token', null)
            res.redirect(`${process.env.LOCAL_FRONTEND_URL}/auth/register`)
        }
    });
})

app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/auth/local/failure' }),
    (req, res) => {
        res.json({ 
            success: true,
            data: req.body
        })
    }
);

app.get('/auth/local/failure', (req, res) => {
    res.json({
        success: false,
        message: 'local login auth failed!'
    })
})

app.listen(PORT, () => {
    console.log(`>> Server listening on ${PORT}...`)
})