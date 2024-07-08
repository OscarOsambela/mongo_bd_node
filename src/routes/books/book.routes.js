const express = require('express')
const router = express.Router()
const Book = require('../../models/book.model')
const multer = require('multer')
const path = require('path')

// Configuración de multer para almacenr archivos en el sistema de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

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
    // req.params.id
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
    const limit = parseInt(req.query.limit, 10) || 100 // Número de elementos por página
    const offset = parseInt(req.query.offset, 10) || 0 // Desplazamiento en los elementos
    const search = req.query.search || ''
    let sort = req.query.sort || 'title'
    let genre = req.query.genre || 'All'
    let author = req.query.author || ''
    let title = req.query.title || ''
    const publicationDate = req.query.publicationDate || 'All'

    // Obtener las opciones de género distintas
    const genreOptions = await Book.distinct('genre')
    const authorOptions = await Book.distinct('author')
    const titleOptions = await Book.distinct('title')
    const publicationDateOptions = await Book.distinct('publicationDate')

    // Ajustar el filtro de género si no es "All"
    if (genre !== 'All') {
      genre = genre.split(',').map(g => g.trim())
    } else {
      genre = genreOptions
    }

    if (author !== '') {
      author = author.split(',').map(g => g.trim())
    } else {
      author = authorOptions
    }

    if (title !== '') {
      title = title.split(',').map(g => g.trim())
    } else {
      title = titleOptions
    }

    // Configurar el criterio de ordenación
    sort = req.query.sort ? req.query.sort.split(',') : [sort]
    const sortBy = {}
    sortBy[sort[0]] = sort[1] ? sort[1] : 'asc'

    // Construir la consulta
    const query = {
      title: { $regex: search, $options: 'i', $in: title },
      genre: { $in: genre },
      author: { $in: author }
    }

    if (publicationDate && /^\d{4}-\d{4}$/.test(publicationDate)) {
      const [start, end] = publicationDate.split('-').map(Number)
      if (!isNaN(start) && !isNaN(end)) {
        query.publicationDate = { $gte: start, $lte: end }
      } else {
        console.error(`Invalid publicationDate format or values: ${publicationDate}`)
      }
    } else if (publicationDate !== 'All') {
      console.error(`Invalid publicationDate format or values: ${publicationDate}`)
    }

    // Ejecutar la consulta con paginación
    const books = await Book.find(query)
      .sort(sortBy)
      .skip(offset) // Desplazamiento para la paginación
      .limit(limit) // Número de elementos por página

    // Obtener el total de documentos que coinciden con la consulta
    const totalBooks = await Book.countDocuments(query)

    // Construir la respuesta
    const response = {
      error: false,
      total: totalBooks,
      page: Math.floor(offset / limit) + 1, // Calcula la página basada en el offset y el límite
      limit,
      genres: genreOptions,
      authors: authorOptions,
      titles: titleOptions,
      publicationDates: publicationDateOptions,
      books
    }

    res.status(200).json(response)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: 'Internal Server Error' })
  }
})

// api para obtener todos los libros sin queries
router.get('/all', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10)
    const offset = parseInt(req.query.offset, 10) || 0
    const search = req.query.search || ''
    let title = req.query.title || ''

    const titleOptions = await Book.distinct('title')

    if (title !== '') {
      title = title.split(',').map(g => g.trim())
    } else {
      title = titleOptions
    }

    const query = {
      title: { $regex: search, $options: 'i', $in: title }
    }

    const response = await Book.find(query)
      .skip(offset) // Desplazamiento para la paginación
      .limit(limit) // Número de elementos por página
    const totalBooks = await Book.countDocuments(query)

    const responseAllBooks = {
      error: false,
      total: totalBooks,
      page: Math.floor(offset / limit) + 1, // Calcula la página basada en el offset y el límite
      limit,
      titles: titleOptions,
      response
    }

    res.status(200).json(responseAllBooks) // Success
  } catch (error) {
    res.status(500).json({ message: error.message }) // Internal Server Error
  }
})

// Crear un nuevo libro (recurso) [POST]
router.post('/', upload.single('image'), async (req, res) => {
  const { title, author, genre, publicationDate, fragment } = req.body
  const imagePath = req.file?.path
  if (!title || !author || !genre || !publicationDate) {
    return res.status(400).json({
      message: 'Los campos título, autor, género, fecha e imagen son obligatorios'
    })
  }

  const book = new Book({
    title,
    author,
    genre,
    publicationDate,
    fragment,
    imagePath
  })

  try {
    const newBook = await book.save()
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
router.put('/:id', getBook, upload.single('image'), async (req, res) => {
  try {
    const book = res.book
    book.title = req.body.title || book.title
    book.author = req.body.author || book.author
    book.genre = req.body.genre || book.genre
    book.publicationDate = req.body.publicationDate || book.publicationDate
    book.fragment = req.body.fragment || book.fragment
    if (req.file) {
      book.imagePath = req.file.path
    }
    const updatedBook = await book.save()
    res.json(updatedBook)
  } catch (error) {
    res.status(400).json({ message: error.message })
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
