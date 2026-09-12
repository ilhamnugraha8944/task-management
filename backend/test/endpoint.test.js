process.env.JWT_SECRET = 'unit-test-secret'

const assert = require('node:assert/strict')
const http = require('node:http')
const test = require('node:test')
const bcrypt = require('bcrypt')
const express = require('express')

const db = require('../src/config/database')
const authRepository = require('../src/repository/authRepository')
const taskRepository = require('../src/repository/taskRepository')
const routes = require('../src/routes/route')

const originalAuthRepository = {
  findByEmail: authRepository.findByEmail,
  createUser: authRepository.createUser,
}
const originalTaskRepository = {
  findAllByUserId: taskRepository.findAllByUserId,
  addTask: taskRepository.addTask,
  updateTask: taskRepository.updateTask,
  deleteTask: taskRepository.deleteTask,
}

const app = express()
app.use(express.json())
app.get('/api/health', (req, res) => res.json({ message: 'API berjalan' }))
app.use('/api', routes)

let server
let baseUrl
let accessToken
let lastTaskRepositoryCall
let userExists = false

const testUser = {
  id: 7,
  email: 'tester@example.com',
  password: null,
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })

  return {
    status: response.status,
    body: await response.json(),
  }
}

test.before(async () => {
  testUser.password = await bcrypt.hash('password123', 4)

  authRepository.findByEmail = async (email) =>
    email === testUser.email && userExists ? testUser : null
  authRepository.createUser = async (email, password, fullname) => {
    lastTaskRepositoryCall = { email, password, fullname }
    userExists = true
    return testUser.id
  }

  taskRepository.findAllByUserId = async (userId, status) => {
    lastTaskRepositoryCall = { userId, status }
    return [
      {
        id: 1,
        title: 'Selesaikan laporan',
        description: 'Deskripsi tugas',
        status: status || 'pending',
        deadline: '2026-09-20',
      },
    ]
  }
  taskRepository.addTask = async (...args) => {
    lastTaskRepositoryCall = args
    return true
  }
  taskRepository.updateTask = async (...args) => {
    lastTaskRepositoryCall = args
    return true
  }
  taskRepository.deleteTask = async (...args) => {
    lastTaskRepositoryCall = args
    return true
  }

  await new Promise((resolve) => {
    server = http.createServer(app).listen(0, resolve)
  })

  baseUrl = `http://127.0.0.1:${server.address().port}`
})

test.after(async () => {
  authRepository.findByEmail = originalAuthRepository.findByEmail
  authRepository.createUser = originalAuthRepository.createUser
  taskRepository.findAllByUserId = originalTaskRepository.findAllByUserId
  taskRepository.addTask = originalTaskRepository.addTask
  taskRepository.updateTask = originalTaskRepository.updateTask
  taskRepository.deleteTask = originalTaskRepository.deleteTask

  await new Promise((resolve) => server.close(resolve))
  await db.end()
})

test('GET /api/health mengembalikan status API', async () => {
  const result = await request('/api/health')

  assert.equal(result.status, 200)
  assert.deepEqual(result.body, { message: 'API berjalan' })
})

test('POST /api/auth/register mendaftarkan user', async () => {
  const result = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: 'password123',
      fullname: 'Tester Taskboard',
    }),
  })

  assert.equal(result.status, 201)
  assert.equal(result.body.message, 'Registrasi berhasil')
  assert.deepEqual(result.body.user, {
    id: testUser.id,
    email: testUser.email,
  })
  assert.equal(lastTaskRepositoryCall.fullname, 'Tester Taskboard')
})

test('POST /api/auth/login mengembalikan JWT', async () => {
  const result = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: 'password123',
    }),
  })

  assert.equal(result.status, 200)
  assert.equal(result.body.message, 'Login berhasil')
  assert.equal(typeof result.body.token, 'string')
  assert.deepEqual(result.body.user, {
    id: testUser.id,
    email: testUser.email,
  })

  accessToken = result.body.token
})

test('GET /api/tasks mengembalikan task milik user login', async () => {
  const result = await request('/api/tasks', {
    headers: { authorization: `Bearer ${accessToken}` },
  })

  assert.equal(result.status, 200)
  assert.equal(lastTaskRepositoryCall.userId, testUser.id)
  assert.equal(lastTaskRepositoryCall.status, undefined)
  assert.equal(result.body.data[0].title, 'Selesaikan laporan')
})

test('GET /api/tasks?status=done meneruskan filter status', async () => {
  const result = await request('/api/tasks?status=done', {
    headers: { authorization: `Bearer ${accessToken}` },
  })

  assert.equal(result.status, 200)
  assert.equal(lastTaskRepositoryCall.status, 'done')
  assert.equal(result.body.data[0].status, 'done')
})

test('POST /api/tasks menambahkan task', async () => {
  const body = {
    title: 'Task baru',
    description: 'Deskripsi baru',
    status: 'pending',
    deadline: '2026-09-20',
  }
  const result = await request('/api/tasks', {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  })

  assert.equal(result.status, 201)
  assert.equal(result.body.message, 'Tugas berhasil ditambahkan')
  assert.deepEqual(lastTaskRepositoryCall, [
    testUser.id,
    body.title,
    body.description,
    body.status,
    body.deadline,
  ])
})

test('PUT /api/tasks/:id mengubah task', async () => {
  const body = {
    title: 'Task diperbarui',
    description: 'Deskripsi diperbarui',
    status: 'in-progress',
    deadline: '2026-09-25',
  }
  const result = await request('/api/tasks/1', {
    method: 'PUT',
    headers: { authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  })

  assert.equal(result.status, 200)
  assert.equal(result.body.message, 'Tugas berhasil diperbarui')
  assert.deepEqual(lastTaskRepositoryCall, [
    1,
    testUser.id,
    body.title,
    body.description,
    body.status,
    body.deadline,
  ])
})

test('DELETE /api/tasks/:id menghapus task', async () => {
  const result = await request('/api/tasks/1', {
    method: 'DELETE',
    headers: { authorization: `Bearer ${accessToken}` },
  })

  assert.equal(result.status, 200)
  assert.equal(result.body.message, 'Tugas berhasil dihapus')
  assert.deepEqual(lastTaskRepositoryCall, [1, testUser.id])
})

test('endpoint task menolak request tanpa JWT', async () => {
  const result = await request('/api/tasks')

  assert.equal(result.status, 401)
  assert.equal(result.body.message, 'Token tidak ditemukan')
})
