/******************************* imports **************************************/
const express = require('express')
const cors = require('cors')
// const session = require('express-session');
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session')
const ioRedis = require('ioredis')
const RedisStore = require('connect-redis').default
require('dotenv').config();

//------------------------ constants ------------------------------
const redisConfig = {
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
}
const PORT = process.env.PORT || 8000

//------------------------------- initializations ------------------------------

const app = express()
const client = new ioRedis(redisConfig);
client.on('connect', () => {
    console.log('Redis Client Connected...');
})
const redisStore = new RedisStore({ client })

//---------------------------- Middlewares ------------------------------------

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(cookieParser())
// app.set('trust proxy', 1) 
app.use(cookieSession({
    maxAge: 20 * 1000,
    keys: ['secret-key'],
    httpOnly: true,
    // sameSite: 'none',
    // secure: 'auto'
}))
app.use(express.json())

app.use((req, res, next) => {
    const op = {
        isChanged: req.session.isChanged,
        isNew: req.session.isNew,
        isPopulated: req.session.isPopulated
    }
    console.log(op)
    req.session = req.body
    console.log(op)
    next()
})

/************************************** Routes *************************************/

app.get('/', (req, res) => {
    // console.log(req.session)
    // console.log(req.session.id)
    res.json({ success: true })
})
app.post('/test', (req, res) => {
    const op = {
        isChanged: req.session.isChanged,
        isNew: req.session.isNew,
        isPopulated: req.session.isPopulated
    }
    console.log(op)
    console.log(req.session, req.session.id)
    console.log(op)
    // console.log(req.body)
    console.log('---')
    res.json({ data: req.body, url: req.url })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})