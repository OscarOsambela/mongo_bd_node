const express = require('express')
const router = express.Router()
const Book = require('../models/book.model')

// middleware
const getBook = async (req, res, next) => {
  let book
  const { id } = req.params

  // id definido de mongo
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({
      message: 'El ID del libro no es válido'
    })
  }
  try {
    book = await Book.findById(id)
    if (!book) {
      return res.status(404).json({
        message: 'El Libro no fue encontrado.'
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
  res.book = book
  next()
}

router.get('/', async (req, res) => {
  try {
    const books = await Book.find()
    console.log('GET ALL', books)
    if (books.length === 0) {
      return res.status(204).json([])
    }
    res.json(books)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Crear un nuevo libro (recurso) [POST]
router.post('/', async (req, res) => {
  const { title, author, genre, publicationDate } = req?.body
  if (!title || !author || !genre || !publicationDate) {
    return res.status(400).json({
      message: 'Los campos título, autor, género y fecha son obligatorios'
    })
  }

  const book = new Book(
    {
      title,
      author,
      genre,
      publicationDate
    }
  )

  try {
    const newBook = await book.save()
    console.log(newBook)
    res.status(201).json(newBook)
  } catch (error) {
    res.status(400).json({
      message: error.message
    })
  }
})

// obtener libro por id
router.get('/:id', getBook, async (req, res) => {
  res.json(res.book)
})

// editar libro
router.put('/:id', getBook, async (req, res) => {
  try {
    const book = res.book
    book.title = req.body.title || book.title
    book.author = req.body.author || book.author
    book.genre = req.body.genre || book.genre
    book.publicationDate = req.body.publicationDate || book.publicationDate

    const updateBook = await book.save()
    res.json(updateBook)
  } catch (error) {
    res.status(400).json({
      message: error.message
    })
  }
})

router.patch('/:id', getBook, async (req, res) => {
  if (!req.body.title && !req.body.author && !req.body.genre && !req.body.publicationDate) {
    res.status(400).json({
      message: 'Al menos uno de los campos debe ser enviado.'
    })
  }
  try {
    const book = res.book
    book.title = req.body.title || book.title
    book.author = req.body.author || book.author
    book.genre = req.body.genre || book.genre
    book.publicationDate = req.body.publicationDate || book.publicationDate

    const updateBook = await book.save()
    res.json(updateBook)
  } catch (error) {
    res.status(400).json({
      message: error.message
    })
  }
})

router.delete('/:id', getBook, async (req, res) => {
  try {
    const book = res.book
    await book.deleteOne({
      _id: book._id
    })
    res.json({
      message: `El libro ${book.title} fue eliminado correctamente`
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})

module.exports = router
