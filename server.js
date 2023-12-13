const express = require('express')
const cors = require('cors')
const { createClient } = require('redis');
const { nanoid } = require('nanoid');
require('dotenv').config();

const PORT = process.env.PORT || 8000
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});
client.on('error', (err) => {
    console.log(err)
})
client.on('connect', () => {
    console.log('Connected to Redis!');
})
if (!client.isOpen) {
    client.connect()
}


const app = express()

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // credentials: true
}))
app.use(express.json())


app.get('/', (req, res) => {
    res.send('welcome')
})

app.post('/users/register', async (req, res) => {
    try {
        await client.hSet(`user:${nanoid()}`, { ...req.body })
        console.log(user)
        res.json({ success: true, message: 'User registered successfully.' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: 'Failed to register user.' })
    }
})

app.get('/users', async (req, res) => {
    try {
        const keys = await client.keys('user:*')
        let users = await Promise.all(keys.map((key) => client.hGetAll(key)));
        res.json({ success: true, users })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: 'Failed to get user.' })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})