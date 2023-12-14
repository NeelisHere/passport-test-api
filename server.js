const express = require('express')
const cors = require('cors')
const { createClient } = require('redis');
const { nanoid } = require('nanoid');
require('dotenv').config();

const PORT = process.env.PORT || 8000
const redisConfig = {
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
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

const server = require('http').createServer(app)

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

const main = async () => {
    const client = createClient(redisConfig);
    await client.connect()

    const clientPub = client.duplicate()
    await clientPub.connect()
    const clientSub = client.duplicate()
    await clientSub.connect()

    io.on('connection', async (socket) => {
        console.log(socket.id)
        socket.on('join-room', async ({ roomId }) => {
            console.log(roomId)
            await client.sAdd(`room:${roomId}`, socket.id)
            await clientSub.subscribe(`room:${roomId}`)
        })
        socket.on('message', async ({ text }) => {
            console.log(text, socket.id)
        })

        socket.on('disconnect', async (reason) => {
            console.log(reason)
            // await client.unsubscribe(roomId)
            // await client.sRem(`room:${roomId}`, socket.id)
        })
    })

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

main()