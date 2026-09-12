<template>
  <main class="task-page">
    <aside class="task-sidebar" aria-label="Navigasi utama">
      <router-link class="task-brand" :to="{ name: 'task' }">
        <span class="task-brand__mark" aria-hidden="true"></span>
        <span>
          <strong>Taskboard</strong>
          <small>Personal workspace</small>
        </span>
      </router-link>

      <nav class="task-nav">
        <a class="task-nav__link task-nav__link--active" href="#task-list">Task Management</a>
      </nav>

      <p class="task-sidebar__note">Kelola pekerjaan Anda dalam satu tempat.</p>
    </aside>

    <section class="task-shell">
      <header class="task-topbar">
        <div>
          <p class="task-eyebrow">Workspace</p>
          <h1>Daftar tugas</h1>
        </div>
        <button class="btn task-logout" type="button" @click="logout">Keluar</button>
      </header>

      <section id="task-list" class="task-content" aria-labelledby="task-list-title">
        <div class="task-content__heading">
          <div>
            <p class="task-eyebrow">Task management</p>
            <h2 id="task-list-title">Tugas saya</h2>
            <p>Catat, filter, dan perbarui pekerjaan yang perlu diselesaikan.</p>
          </div>
          <button class="btn task-button" type="button" @click="openCreatePanel">Tambah tugas</button>
        </div>

        <section class="task-card" aria-label="Daftar dan filter tugas">
          <div class="task-card__filters">
            <label>
              <span>Judul</span>
              <input v-model.trim="filters.title" class="form-control" type="search" placeholder="Cari judul" />
            </label>
            <label>
              <span>Deskripsi</span>
              <input
                v-model.trim="filters.description"
                class="form-control"
                type="search"
                placeholder="Cari deskripsi"
              />
            </label>
            <label>
              <span>Status</span>
              <select v-model="filters.status" class="form-select">
                <option value="">Semua status</option>
                <option v-for="status in statuses" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </label>
            <label>
              <span>Deadline</span>
              <input v-model="filters.deadline" class="form-control" type="date" />
            </label>
            <button class="btn task-clear" type="button" @click="clearFilters">Reset filter</button>
          </div>

          <div class="task-card__meta">
            <span>{{ filteredTasks.length }} tugas ditemukan</span>
            <span v-if="tasks.length" class="task-card__total">dari {{ tasks.length }} tugas</span>
          </div>

          <div class="table-responsive">
            <table class="table task-table align-middle mb-0">
              <thead>
                <tr>
                  <!-- <th scope="col">No</th> -->
                  <th scope="col">Title</th>
                  <th scope="col">Description</th>
                  <th scope="col">Status</th>
                  <th scope="col">Deadline</th>
                  <th scope="col" class="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in paginatedTasks" :key="task.id">
                  <td class="task-table__title">{{ task.title }}</td>
                  <td class="task-table__description">{{ task.description || '—' }}</td>
                  <td>
                    <span class="task-status" :class="`task-status--${task.status}`">
                      {{ statusLabel(task.status) }}
                    </span>
                  </td>
                  <td>{{ formatDeadline(task.deadline) }}</td>
                  <td>
                    <div class="task-actions">
                      <button class="btn task-action" type="button" @click="openEditPanel(task)">Edit</button>
                      <button class="btn task-action task-action--danger" type="button" @click="deleteTask(task)">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredTasks.length">
                  <td class="task-empty" colspan="5">
                    <strong>{{ tasks.length ? 'Tidak ada tugas yang cocok.' : 'Belum ada tugas.' }}</strong>
                    <span>
                      {{ tasks.length ? 'Coba ubah filter pencarian Anda.' : 'Gunakan tombol Tambah tugas untuk membuat tugas pertama.' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <nav class="task-pagination" aria-label="Pagination tugas">
            <button
              class="btn task-pagination__button"
              type="button"
              :disabled="currentPage === 1"
              @click="currentPage -= 1"
            >
              Sebelumnya
            </button>
            <div class="task-pagination__pages">
              <button
                v-for="page in totalPages"
                :key="page"
                class="btn task-pagination__page"
                :class="{ 'task-pagination__page--active': currentPage === page }"
                type="button"
                :disabled="!filteredTasks.length"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
            </div>
            <button
              class="btn task-pagination__button"
              type="button"
              :disabled="currentPage === totalPages"
              @click="currentPage += 1"
            >
              Berikutnya
            </button>
          </nav>
        </section>
      </section>
    </section>

    <div v-if="panelVisible" class="task-backdrop" @click="closePanel"></div>
    <aside
      class="task-drawer"
      :class="{ 'task-drawer--open': panelVisible }"
      :aria-hidden="!panelVisible"
      aria-labelledby="task-drawer-title"
    >
      <div class="task-drawer__header">
        <div>
          <p class="task-eyebrow">{{ editingId ? 'Perbarui tugas' : 'Tugas baru' }}</p>
          <h2 id="task-drawer-title">{{ editingId ? 'Edit tugas' : 'Tambah tugas' }}</h2>
        </div>
        <button class="btn task-close" type="button" aria-label="Tutup formulir" @click="closePanel">Tutup</button>
      </div>

      <form class="task-form" :class="{ 'was-validated': wasSubmitted }" novalidate @submit.prevent="saveTask">
        <div>
          <label class="form-label" for="task-title">Title</label>
          <input id="task-title" v-model.trim="form.title" class="form-control" type="text" maxlength="255" required />
          <div class="invalid-feedback">Title wajib diisi.</div>
        </div>

        <div>
          <label class="form-label" for="task-description">Description</label>
          <textarea id="task-description" v-model="form.description" class="form-control" rows="5"></textarea>
        </div>

        <div>
          <label class="form-label" for="task-status">Status</label>
          <select id="task-status" v-model="form.status" class="form-select">
            <option v-for="status in statuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="form-label" for="task-deadline">Deadline</label>
          <input id="task-deadline" v-model="form.deadline" class="form-control" type="date" />
        </div>

        <div class="task-form__actions">
          <button class="btn task-cancel" type="button" @click="closePanel">Batal</button>
          <button class="btn task-button" type="submit">{{ editingId ? 'Simpan perubahan' : 'Simpan tugas' }}</button>
        </div>
      </form>
    </aside>
  </main>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '../config/api'

const router = useRouter()
const tasks = ref([])
const panelVisible = ref(false)
const editingId = ref(null)
const wasSubmitted = ref(false)
const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 5

const filters = reactive({
  title: '',
  description: '',
  status: '',
  deadline: '',
})

const form = reactive({
  title: '',
  description: '',
  status: 'pending',
  deadline: '',
})

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

const filteredTasks = computed(() => {
  const title = filters.title.toLowerCase()
  const description = filters.description.toLowerCase()

  return tasks.value.filter((task) => {
    return (
      task.title.toLowerCase().includes(title) &&
      (task.description || '').toLowerCase().includes(description) &&
      (!filters.status || task.status === filters.status) &&
      (!filters.deadline || task.deadline === filters.deadline)
    )
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTasks.value.length / itemsPerPage)))

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTasks.value.slice(start, start + itemsPerPage)
})

function resetForm() {
  form.title = ''
  form.description = ''
  form.status = 'pending'
  form.deadline = ''
  wasSubmitted.value = false
}

function openCreatePanel() {
  editingId.value = null
  resetForm()
  panelVisible.value = true
}

function openEditPanel(task) {
  editingId.value = task.id
  form.title = task.title
  form.description = task.description
  form.status = task.status
  form.deadline = task.deadline ? task.deadline.split('T')[0] : ''
  wasSubmitted.value = false
  panelVisible.value = true
}

function closePanel() {
  panelVisible.value = false
  resetForm()
  editingId.value = null
}

async function getTasks() {
  loading.value = true

  try {
    const params = new URLSearchParams()

    if (filters.status) {
      params.set('status', filters.status)
    }

    const token = localStorage.getItem('token')
    const query = params.toString()
    console.log(query);
    const url = `${API_URL}/tasks${query ? `?${query}` : ''}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil tugas')
    }

    tasks.value = data.data
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal memuat tugas',
      text: error.message,
    })
  } finally {
    loading.value = false
  }
}

onMounted(getTasks)

watch(
  () => filters.status,
  getTasks,
)

watch(
  () => [filters.title, filters.description, filters.status, filters.deadline],
  () => {
    currentPage.value = 1
  },
)

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

async function saveTask(event) {
  wasSubmitted.value = true

  if (!event.currentTarget.checkValidity()) return

  const taskData = {
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    deadline: form.deadline,
  }

  if (editingId.value) {
    try {
      const response = await fetch(`${API_URL}/tasks/${editingId.value}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(taskData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Gagal memperbarui tugas')
      }

      closePanel()
      await Swal.fire({
        icon: 'success',
        title: 'Tugas diperbarui',
        text: data.message || 'Tugas berhasil diperbarui.',
      })
      await getTasks()
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui tugas',
        text: error.message,
      })
    }
    return
  }

  try {
      const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(taskData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Gagal menambahkan tugas')
    }

    closePanel()
    await Swal.fire({
      icon: 'success',
      title: 'Tugas ditambahkan',
      text: data.message || 'Tugas berhasil ditambahkan.',
    })
    await getTasks()
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal menambahkan tugas',
      text: error.message,
    })
  }
}

async function deleteTask(task) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus tugas?',
    text: `Tugas “${task.title}” akan dihapus.`,
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#087f5b',
  })

  if (result.isConfirmed) {
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menghapus tugas')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Tugas dihapus',
        text: data.message || 'Tugas berhasil dihapus.',
      })
      await getTasks()
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal menghapus tugas',
        text: error.message,
      })
    }
  }
}

function clearFilters() {
  filters.title = ''
  filters.description = ''
  filters.status = ''
  filters.deadline = ''
}

function statusLabel(status) {
  return statuses.find((item) => item.value === status)?.label || status
}

function formatDeadline(deadline) {
  if (!deadline) return '—'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${deadline}`))
}

function logout() {
  localStorage.removeItem('token')
  router.replace('/login')
}
</script>

<style scoped>
.task-page {
  display: flex;
  min-height: 100dvh;
  color: var(--tm-ink);
  background: #f7faf8;
}

.task-sidebar {
  display: flex;
  position: sticky;
  top: 0;
  flex: 0 0 16.5rem;
  flex-direction: column;
  min-height: 100dvh;
  padding: 1.75rem 1.25rem;
  border-right: 1px solid var(--tm-border);
  background: #ffffff;
}

.task-brand {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--tm-ink);
  text-decoration: none;
}

.task-brand strong,
.task-brand small {
  display: block;
}

.task-brand strong {
  font-size: 1.15rem;
  letter-spacing: -0.03em;
}

.task-brand small,
.task-sidebar__note,
.task-content__heading p,
.task-card__meta {
  color: var(--tm-muted);
}

.task-brand small {
  margin-top: 0.1rem;
  font-size: 0.73rem;
}

.task-brand__mark {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.8rem;
  background: linear-gradient(145deg, var(--tm-green) 0 55%, #62bf94 55% 100%);
}

.task-nav {
  margin-top: 4rem;
}

.task-nav__link {
  display: block;
  padding: 0.78rem 0.9rem;
  border-radius: 0.75rem;
  color: var(--tm-muted);
  font-size: 0.93rem;
  font-weight: 700;
  text-decoration: none;
}

.task-nav__link--active {
  color: var(--tm-green-dark);
  background: var(--tm-green-soft);
}

.task-sidebar__note {
  margin: auto 0 0;
  font-size: 0.8rem;
  line-height: 1.6;
}

.task-shell {
  min-width: 0;
  flex: 1;
}

.task-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 7.25rem;
  padding: 1.5rem clamp(1.25rem, 4vw, 4rem);
  border-bottom: 1px solid var(--tm-border);
  background: #ffffff;
}

.task-eyebrow {
  margin: 0 0 0.3rem;
  color: var(--tm-green);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.task-topbar h1,
.task-content__heading h2,
.task-drawer h2 {
  margin: 0;
  font-weight: 750;
  letter-spacing: -0.04em;
}

.task-topbar h1 {
  font-size: clamp(1.65rem, 3vw, 2.1rem);
}

.task-logout,
.task-clear,
.task-cancel,
.task-action,
.task-close {
  border: 1px solid var(--tm-border);
  color: var(--tm-green-dark);
  background: #ffffff;
  font-weight: 700;
}

.task-logout:hover,
.task-clear:hover,
.task-cancel:hover,
.task-action:hover,
.task-close:hover {
  border-color: var(--tm-green);
  color: var(--tm-green-dark);
  background: var(--tm-green-soft);
}

.task-content {
  max-width: 96rem;
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 3.5rem);
}

.task-content__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.task-content__heading h2 {
  font-size: clamp(1.7rem, 3vw, 2.35rem);
}

.task-content__heading p:not(.task-eyebrow) {
  margin: 0.55rem 0 0;
}

.task-button {
  flex: none;
  border-color: var(--tm-green);
  color: #ffffff;
  background: var(--tm-green);
  font-weight: 750;
}

.task-button:hover,
.task-button:focus {
  border-color: var(--tm-green-dark);
  color: #ffffff;
  background: var(--tm-green-dark);
}

.task-card {
  overflow: hidden;
  border: 1px solid var(--tm-border);
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 1rem 2.5rem rgb(8 127 91 / 5%);
}

.task-card__filters {
  display: grid;
  grid-template-columns: minmax(11rem, 1.3fr) minmax(11rem, 1.5fr) minmax(9rem, 1fr) minmax(9rem, 1fr) auto;
  gap: 0.9rem;
  align-items: end;
  padding: 1.35rem;
  border-bottom: 1px solid var(--tm-border);
}

.task-card__filters label {
  min-width: 0;
}

.task-card__filters label span {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--tm-ink);
  font-size: 0.78rem;
  font-weight: 750;
}

.task-card :deep(.form-control),
.task-card :deep(.form-select),
.task-drawer :deep(.form-control),
.task-drawer :deep(.form-select) {
  min-height: 2.75rem;
  border-color: var(--tm-border);
  box-shadow: none;
}

.task-card :deep(.form-control:focus),
.task-card :deep(.form-select:focus),
.task-drawer :deep(.form-control:focus),
.task-drawer :deep(.form-select:focus) {
  border-color: var(--tm-green);
  box-shadow: 0 0 0 0.25rem rgb(8 127 91 / 14%);
}

.task-clear {
  min-height: 2.75rem;
  white-space: nowrap;
}

.task-card__meta {
  display: flex;
  gap: 0.35rem;
  padding: 1rem 1.35rem;
  font-size: 0.85rem;
}

.task-card__total {
  color: #84958c;
}

.task-table {
  min-width: 51rem;
}

.task-table thead th {
  padding: 0.85rem 1.35rem;
  border-bottom-color: var(--tm-border);
  color: var(--tm-muted);
  background: #fbfdfc;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.task-table tbody td {
  padding: 1rem 1.35rem;
  border-bottom-color: #edf3ef;
  color: var(--tm-muted);
  font-size: 0.9rem;
}

.task-table__title {
  min-width: 12rem;
  color: var(--tm-ink) !important;
  font-weight: 750;
}

.task-table__description {
  max-width: 22rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-status {
  display: inline-flex;
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 750;
}

.task-status--pending {
  color: #52665c;
  background: #eef2ef;
}

.task-status--in-progress {
  color: var(--tm-green-dark);
  background: var(--tm-green-soft);
}

.task-status--done {
  color: #ffffff;
  background: var(--tm-green);
}

.task-actions {
  display: flex;
  justify-content: end;
  gap: 0.45rem;
}

.task-action {
  padding: 0.35rem 0.6rem;
  font-size: 0.78rem;
}

.task-action--danger {
  color: #6f514c;
}

.task-empty {
  padding: 3.5rem 1.5rem !important;
  text-align: center;
}

.task-empty strong,
.task-empty span {
  display: block;
}

.task-empty strong {
  color: var(--tm-ink);
}

.task-empty span {
  margin-top: 0.3rem;
  font-size: 0.85rem;
}

.task-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.35rem;
  border-top: 1px solid var(--tm-border);
}

.task-pagination__pages {
  display: flex;
  gap: 0.35rem;
}

.task-pagination__button,
.task-pagination__page {
  min-width: 2.25rem;
  border: 1px solid var(--tm-border);
  color: var(--tm-green-dark);
  background: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
}

.task-pagination__button:disabled {
  color: #a7b7ae;
  background: #f5f8f6;
}

.task-pagination__page--active,
.task-pagination__page--active:hover {
  border-color: var(--tm-green);
  color: #ffffff;
  background: var(--tm-green);
}

.task-pagination__page:disabled {
  border-color: var(--tm-border);
  color: #a7b7ae;
  background: #f5f8f6;
}

.task-backdrop {
  position: fixed;
  z-index: 1040;
  inset: 0;
  background: rgb(24 49 39 / 28%);
}

.task-drawer {
  position: fixed;
  z-index: 1045;
  top: 0;
  right: 0;
  display: flex;
  width: min(100%, 31rem);
  height: 100dvh;
  flex-direction: column;
  padding: 1.5rem;
  border-left: 1px solid var(--tm-border);
  background: #ffffff;
  box-shadow: -1rem 0 3rem rgb(8 127 91 / 12%);
  transform: translateX(100%);
  transition: transform 180ms ease;
}

.task-drawer--open {
  transform: translateX(0);
}

.task-drawer__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--tm-border);
}

.task-drawer h2 {
  font-size: 1.65rem;
}

.task-close {
  flex: none;
  font-size: 0.8rem;
}

.task-form {
  display: grid;
  gap: 1.25rem;
  overflow-y: auto;
  padding: 1.5rem 0;
}

.task-form :deep(textarea.form-control) {
  min-height: auto;
  resize: vertical;
}

.task-form__actions {
  display: flex;
  justify-content: end;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

@media (max-width: 991.98px) {
  .task-sidebar {
    display: none;
  }
}

@media (max-width: 767.98px) {
  .task-topbar {
    min-height: 5.75rem;
  }

  .task-content__heading {
    align-items: start;
    flex-direction: column;
  }

  .task-card__filters {
    grid-template-columns: 1fr 1fr;
  }

  .task-clear {
    grid-column: span 2;
  }
}

@media (max-width: 499.98px) {
  .task-topbar,
  .task-content {
    padding-inline: 1rem;
  }

  .task-card__filters {
    grid-template-columns: 1fr;
  }

  .task-clear {
    grid-column: auto;
  }

  .task-drawer {
    padding: 1.25rem;
  }

  .task-pagination {
    align-items: stretch;
    flex-direction: column;
  }

  .task-pagination__pages {
    justify-content: center;
    order: -1;
  }
}
</style>
