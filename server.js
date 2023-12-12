const app = require('express')()
const cors = require('cors')

app.use(cors())
const PORT = process.env.POST || 8000

app.get('/', (req, res) => {
    res.send('welcome')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})