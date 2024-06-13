const express = require('express')
const { config } = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
config()

const bookRoutes = require('./routes/book.routes')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json()) // parsear body

// // conectar la base de datos
mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB_NAME })
// const db = mongoose.connection
// console.log(db)

app.use('/books', bookRoutes)

app.listen(port, () => {
  console.log(`server listening on port http://localhost: ${port}`)
})
