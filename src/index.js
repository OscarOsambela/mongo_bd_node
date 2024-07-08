const express = require('express')
const { config } = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
config()

const bookRoutes = require('./routes/books/book.routes')
const loginRoutes = require('./routes/login/login.routes')

const app = express()
app.use(express.json())
const port = process.env.PORT || 3000

app.use(bodyParser.json()) // parsear body
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// // conectar la base de datos
mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.MONGO_DB_NAME
})

app.use('/books', bookRoutes)
app.use('/auth', loginRoutes)

app.listen(port, () => {
  console.log(`server listening on port http://localhost: ${port}`)
})

// arrancar docker
// docker compose up -d
