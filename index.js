/******************************* imports **************************************/
const express = require('express')
const cors = require('cors')
const session = require('express-session');
const cookieParser = require("cookie-parser");
const ioRedis = require('ioredis')
const RedisStore = require('connect-redis').default
require('dotenv').config();

//------------------------ constants ------------------------------
// const redisConfig = {
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT
//     }
// }
const PORT = process.env.PORT || 8000

//------------------------------- initializations ------------------------------

const app = express()
// const client = createClient(redisConfig)
// redisClient.connect()
//     .then(() => console.log('Redis Client Connected'))
//     .catch((err) => console.log(err));
const client = new ioRedis({
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});
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
app.use(session({
    secret: 'your-secret-key',
    name: 'session-id',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // secure: false,
        maxAge: 60 * 1000,
    },
    store: redisStore
}));
app.use(express.json())
app.use(cookieParser())

/************************************** Routes *************************************/

app.get('/', (req, res) => {
    console.log(req.session)
    console.log(req.session.id)
    res.json({ success: true })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})