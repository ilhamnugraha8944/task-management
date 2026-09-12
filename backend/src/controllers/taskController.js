const taskRepository = require('../repository/taskRepository')

const validStatuses = ['pending', 'in-progress', 'done']

function normalizeDeadline(deadline) {
    if (deadline === undefined || deadline === null || deadline === '') {
        return null
    }

    if (typeof deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
        return undefined
    }

    const date = new Date(`${deadline}T00:00:00.000Z`)

    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== deadline) {
        return undefined
    }

    return deadline
}

async function list(req, res) {
    try {
        const { status } = req.query

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Status tidak valid',
            })
        }

        const tasks = await taskRepository.findAllByUserId(req.user.id, status)

        return res.json({
            data: tasks,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mengambil daftar tugas',
        })
    }
}

async function add(req, res) {
    try {
        const { title, description, status, deadline } = req.body

        if (!title || !status) {
            return res.status(400).json({
                message: 'title dan status wajib diisi',
            })
        }

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Status tidak valid',
            })
        }

        const normalizedDeadline = normalizeDeadline(deadline)

        if (normalizedDeadline === undefined) {
            return res.status(400).json({
                message: 'Deadline harus menggunakan format YYYY-MM-DD yang valid',
            })
        }

        const addTask = await taskRepository.addTask(req.user.id, title, description, status, normalizedDeadline)

        if (!addTask) {
            return res.status(500).json({ message: 'Gagal menambahkan tugas' })
        }

        return res.status(201).json({
            message: 'Tugas berhasil ditambahkan',
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

async function edit(req, res) {
    try {
        const taskId = Number(req.params.id)
        const { title, description, status, deadline } = req.body

        if (!Number.isSafeInteger(taskId) || taskId < 1) {
            return res.status(400).json({ message: 'ID tugas tidak valid' })
        }

        if (!title || !status) {
            return res.status(400).json({
                message: 'title dan status wajib diisi',
            })
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Status tidak valid',
            })
        }

        const normalizedDeadline = normalizeDeadline(deadline)

        if (normalizedDeadline === undefined) {
            return res.status(400).json({
                message: 'Deadline harus menggunakan format YYYY-MM-DD yang valid',
            })
        }

        const isUpdated = await taskRepository.updateTask(
            taskId,
            req.user.id,
            title,
            description,
            status,
            normalizedDeadline,
        )

        if (!isUpdated) {
            return res.status(404).json({ message: 'Tugas tidak ditemukan' })
        }

        return res.json({ message: 'Tugas berhasil diperbarui' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

async function remove(req, res) {
    try {
        const taskId = Number(req.params.id)

        if (!Number.isSafeInteger(taskId) || taskId < 1) {
            return res.status(400).json({ message: 'ID tugas tidak valid' })
        }

        const isDeleted = await taskRepository.deleteTask(taskId, req.user.id)

        if (!isDeleted) {
            return res.status(404).json({ message: 'Tugas tidak ditemukan' })
        }

        return res.json({ message: 'Tugas berhasil dihapus' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = {
    list,
    add,
    edit,
    remove,
    normalizeDeadline,
}
