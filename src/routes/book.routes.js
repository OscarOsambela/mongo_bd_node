const express = require('express')
const router = express.Router()
const Book = require('../models/book.model')
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
    const limit = parseInt(req.query.limit, 10) || 5 // Número de elementos por página
    const offset = parseInt(req.query.offset, 10) || 0 // Desplazamiento en los elementos
    const search = req.query.search || ''
    let sort = req.query.sort || 'title' // Asegúrate de tener un campo de ordenación consistente, por ejemplo, 'title'
    let genre = req.query.genre || 'All'

    // Obtener las opciones de género distintas
    const genreOptions = await Book.distinct('genre')

    // Ajustar el filtro de género si no es "All"
    if (genre !== 'All') {
      genre = genre.split(',').map(g => g.trim())
    } else {
      genre = genreOptions
    }

    // Configurar el criterio de ordenación
    sort = req.query.sort ? req.query.sort.split(',') : [sort]
    const sortBy = {}
    sortBy[sort[0]] = sort[1] ? sort[1] : 'asc'

    // Construir la consulta
    const query = {
      title: { $regex: search, $options: 'i' },
      genre: { $in: genre }
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
      books
    }

    console.log(response)
    res.status(200).json(response)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: 'Internal Server Error' })
  }
})
// antigua api para obtener los libros
// router.get('/', async (req, res) => {
//   try {
//     const books = await Book.find()
//     if (books.length === 0) {
//       return res.status(204).json([])
//     }
//     res.json(books)
//   } catch (error) {
//     res.status(500).json({ message: error.message })
//   }
// })

// Crear un nuevo libro (recurso) [POST]
router.post('/', upload.single('image'), async (req, res) => {
  const { title, author, genre, publicationDate } = req.body
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
