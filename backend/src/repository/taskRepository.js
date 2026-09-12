const db = require('../config/database')

async function findAllByUserId(userId, status) {
    let query = `
        SELECT id, title, description, status, deadline
        FROM tasks
        WHERE user_id = ?
    `

    const params = [userId]

    if (status) {
        query += ' AND status = ?'
        params.push(status)
    }

    query += ' ORDER BY created_at DESC'

    const [tasks] = await db.execute(query, params)

    return tasks
}

async function addTask(userId, title, description, status, deadline) {

    const [result] = await db.execute(
        'INSERT INTO tasks (user_id, title, description, status, deadline) VALUES (?, ?, ?, ?, ?)',
        [userId, title, description, status, deadline],
    )

    return result.affectedRows === 1

}

async function updateTask(taskId, userId, title, description, status, deadline) {
    const [result] = await db.execute(
        `UPDATE tasks
         SET title = ?, description = ?, status = ?, deadline = ?
         WHERE id = ? AND user_id = ?`,
        [title, description, status, deadline, taskId, userId],
    )

    return result.affectedRows === 1
}

async function deleteTask(taskId, userId) {
    const [result] = await db.execute(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [taskId, userId],
    )

    return result.affectedRows === 1
}

module.exports = {
    findAllByUserId,
    addTask,
    updateTask,
    deleteTask,
}
