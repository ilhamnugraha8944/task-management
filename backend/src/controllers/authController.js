const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRepository = require('../repository/authRepository')

async function register(req, res) {
  try {
    const { email, password, fullname } = req.body
    console.log (fullname)
    if (!email || !password  || !fullname) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' })
    }

    const existingUser = await userRepository.findByEmail(email)

    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah terdaftar' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = await userRepository.createUser(email, hashedPassword, fullname)

    return res.status(201).json({
      message: 'Registrasi berhasil',
      user: {
        id: userId,
        email,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' })
    }

    const user = await userRepository.findByEmail(email)

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      },
    )

    return res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' })
  }
}

module.exports = {
  register,
  login,
}