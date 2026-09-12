const db = require('../config/database')

async function findByEmail(email) {
  const [users] = await db.execute(
    'SELECT id, email, password FROM users WHERE email = ? LIMIT 1',
    [email],
  )

  return users[0]
}

async function createUser(email, password, fullname) {
  const [result] = await db.execute(
    'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
    [email, password, fullname],
  )

  return result.insertId
}

module.exports = {
  findByEmail,
  createUser,
}
