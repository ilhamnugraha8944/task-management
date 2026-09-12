const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization
  const token = authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa' })
  }
}

module.exports = {
  authenticateToken,
}