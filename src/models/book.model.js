const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  publicationDate: {
    type: Number,
    required: true
  },
  imagePath: {
    type: String
  },
  fragment: {
    type: String
  }
})

module.exports = mongoose.model('Book', bookSchema)
