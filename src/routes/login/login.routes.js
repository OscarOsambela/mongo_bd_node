const express = require('express')
const Login = require('../../models/login.model')
const router = express.Router()
const bcrypt = require('bcrypt')
const { userSchema } = require('../../validations/validationSchema')
const saltRounds = parseInt(process.env.SALT_ROUND)
// const path = require('path')

// middleware
// const getBook = async (req, res, next) => {
//   let book
//   const { id } = req.params

// id definido de mongo
//   if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//     return res.status(404).json({
//       message: 'El ID del libro no es válido'
//     })
//   }
//   try {
//     // req.params.id
//     book = await Book.findById(id)
//     if (!book) {
//       return res.status(404).json({
//         message: 'El Libro no fue encontrado.'
//       })
//     }
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message
//     })
//   }
//   res.book = book
//   next()
// }

router.get('/', (req, res) => {
  res.send('este ee el endpoint de login')
})

// Ruta de inicio de sesión
router.post('/register', async (req, res) => {
  const validationResult = userSchema.safeParse(req.body)
  if (!validationResult.success) {
    return res.status(400).json({ message: 'Error de validación', errors: validationResult.error.errors })
  }
  const { username, password } = req.body

  try {
    // Verificar si el usuario ya existe
    const existingUser = await Login.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe.' })
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const isPasswordValid = await bcrypt.compare(password, existingUser)
    if (!isPasswordValid) throw new Error('El password no es vàlido.')

    // Crear un nuevo usuario
    const newUser = new Login({
      username,
      password: hashedPassword
    })

    // Guardar el usuario en la base de datos
    const newRegister = await newUser.save()

    res.status(201).json(newRegister)
  } catch (error) {
    console.error('Error en el registro del usuario:', error)
    res.status(500).json({ message: 'Error al registrar el usuario', error })
  }
})
router.post('/login', async (req, res) => {
  const validationResult = userSchema.safeParse(req.body)
  if (!validationResult.success) {
    return res.status(400).json({ message: 'Error de validación', errors: validationResult.error.errors })
  }
  const { username, password } = req.body
  try {
    // Buscar el usuario por nombre de usuario
    const user = await Login.findOne({ username })
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Comparar la contraseña
    const hashedPassword = await bcrypt.compare(password, user.password)
    console.log(hashedPassword)
    console.log(password === user.password)
    if (!hashedPassword) {
      return res.status(401).json({ message: 'Contraseña  incorrecta' })
    }

    const { password: _, ...publicUser } = user.toObject()

    res.status(200).json({ message: 'Inicio de sesión exitoso', user: publicUser })
  } catch (error) {
    console.error('Error en el inicio de sesión:', error)
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message })
  }
})
router.post('/logout', (req, res) => {})
router.post('/protected', (req, res) => {})

module.exports = router
