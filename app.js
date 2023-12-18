const express = require('express')
const cors = require('cors')
const session = require('express-session');
const cookieParser = require("cookie-parser");
const ioRedis = require('ioredis')
const passport = require('passport')
const connectMongo = require('./connectMongo')
require('dotenv').config();
require('./passport/googleStrategy')

const PORT = process.env.PORT || 8000
const redisConfig = {
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
}
const redisClient = new ioRedis(redisConfig);
connectMongo()
const app = express()

redisClient.on('connect', () => {
    console.log('Connected to Redis...');
});
app.use(cors({
    origin: [process.env.LOCAL_FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(cookieParser())
app.set('trust proxy', 1)
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())



// app.use('/', (req, res) => {
//     res.json({ success: true })
// })

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
    })
);

app.get('/auth/google/success', (req, res) => {
    res.json({
        success: true,
        message: 'Auth successful!',
        user: req.user ? req.user : null
    })
})

app.get('/auth/google/failure', (req, res) => {
    res.json({
        success: false,
        message: 'Auth failed!'
    })
})

app.listen(PORT, () => {
    console.log(`>> Server listening on ${PORT}...`)
})