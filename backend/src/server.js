require('dotenv').config()

const express = require('express')
const cors = require('cors')
const routes = require('./routes/route')
const db = require('./config/database')

const app = express()
const port = process.env.PORT || 3000

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  }),
)

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ message: 'API berjalan' })
})

app.use('/api', routes)

app.listen(port, () => {
  console.log(`API berjalan di http://localhost:${port}`)
})

db.getConnection()
  .then((connection) => {
    console.log('Database MySQL Connected')
    connection.release()
  })
  .catch((error) => {
    console.error('Gagal terhubung ke database MySQL:', error.message)
  })