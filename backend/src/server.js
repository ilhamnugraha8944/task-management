require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()
const port = process.env.PORT || 3000

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)

app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  res.json({ message: 'API berjalan' })
})

app.listen(port, () => {
  console.log(`API berjalan di http://localhost:${port}`)
})