<template>
  <main class="material-page">
    <aside class="material-sidebar" aria-label="Navigasi utama">
      <router-link class="material-brand" :to="{ name: 'material' }">
        <span class="material-brand__mark" aria-hidden="true"></span>
        <span><strong>Kanggo</strong><small>Database Material</small></span>
      </router-link>

      <nav class="material-nav">
        <!-- <router-link class="material-nav__link" :to="{ name: 'task' }">Task Management</router-link> -->
        <router-link
          class="material-nav__link material-nav__link--active"
          :to="{ name: 'material' }"
        >
          Database Material
        </router-link>
      </nav>

      <p class="material-sidebar__note">
        Bandingkan harga cat dengan satu ukuran yang sama: rupiah per kilogram.
      </p>
    </aside>

    <section class="material-shell">
      <header class="material-topbar">
        <div>
          <p class="material-eyebrow">Workspace</p>
          <h1>Database Material</h1>
        </div>
        <!-- <div class="material-topbar__actions">
          <router-link class="btn material-secondary" :to="{ name: 'task' }"
            >Daftar tugas</router-link
          >
          <button class="btn material-secondary" type="button" @click="logout">Keluar</button>
        </div> -->
      </header>

      <section class="material-content" aria-labelledby="material-title">
        <div class="material-heading">
          <div>
            <p class="material-eyebrow">Referensi harga</p>
            <h2 id="material-title">List Material</h2>
          </div>
        </div>

        <p v-if="loading" role="status">Memuat data cat...</p>
        <div v-if="loadError" class="alert alert-danger" role="alert">
          {{ loadError }}
          <button class="btn btn-sm material-secondary" type="button" @click="loadMaterials">
            Coba lagi
          </button>
        </div>

        <div class="material-stats" aria-label="Ringkasan data material cat">
          <article>
            <span>Total data</span><strong>{{ materials.length }}</strong
            ><small>varian harga cat</small>
          </article>
          <article>
            <span>Toko tercatat</span><strong>{{ storeOptions.length }}</strong
            ><small>lokasi pembelian</small>
          </article>
          <article class="material-stats__price">
            <span>Harga terendah</span>
            <strong>{{
              cheapestMaterial ? formatCurrency(pricePerKg(cheapestMaterial)) : '—'
            }}</strong>
            <small>{{
              cheapestMaterial
                ? `${cheapestMaterial.merek} ${cheapestMaterial.subMerek}`
                : 'Belum ada data'
            }}</small>
          </article>
        </div>

        <section class="material-card" aria-label="Daftar dan filter harga cat">
          <div class="m-3 text-end">
            <button
            class="btn material-primary"
            type="button"
            :disabled="loading"
            @click="openCreatePanel"
          >
            Tambah
          </button>
          </div>
          <div class="material-filters">
            <label class="material-search">
              <span>Cari</span>
              <input
                v-model.trim="filters.search"
                class="form-control"
                type="search"
                placeholder="Merek, warna, toko, atau kode"
              />
            </label>
            <label>
              <span>Jenis</span>
              <select v-model="filters.jenis" class="form-select">
                <option value="">Semua jenis</option>
                <option v-for="item in typeOptions" :key="item" :value="item">{{ item }}</option>
              </select>
            </label>
            <label>
              <span>Merek</span>
              <select v-model="filters.merek" class="form-select">
                <option value="">Semua merek</option>
                <option v-for="item in brandOptions" :key="item" :value="item">{{ item }}</option>
              </select>
            </label>
            <label>
              <span>Urutkan</span>
              <select v-model="filters.sort" class="form-select">
                <option value="source">Urutan data</option>
                <option value="price-asc">Harga termurah</option>
                <option value="price-desc">Harga termahal</option>
                <option value="brand">Merek A–Z</option>
              </select>
            </label>
            <button
              class="btn material-secondary material-reset"
              type="button"
              @click="clearFilters"
            >
              Reset
            </button>
          </div>

          <div class="material-card__meta">
            <span>{{ filteredMaterials.length }} data ditemukan</span>
            <span v-if="filters.search || filters.jenis || filters.merek"
              >dari {{ materials.length }} data</span
            >
          </div>

          <div class="table-responsive">
            <table class="table material-table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col" rowspan="2">NOMOR</th>
                  <th scope="col" rowspan="2">AKSI</th>
                  <th scope="col" rowspan="2">MATERIAL</th>
                  <th scope="col" rowspan="2">JENIS</th>
                  <th scope="col" rowspan="2">FOTO</th>
                  <th scope="col" rowspan="2">MEREK</th>
                  <th scope="col" rowspan="2">SUB MEREK</th>
                  <th scope="col" rowspan="2">CODE</th>
                  <th scope="col" rowspan="2">WARNA</th>
                  <th scope="col" rowspan="2">BENTUK</th>
                  <th scope="colgroup" rowspan="2" colspan="3">KEMASAN</th>
                  <th scope="colgroup" colspan="6">ISI</th>
                  <th scope="col" rowspan="2">TOKO</th>
                  <th scope="col" rowspan="2">ALAMAT SINGKAT</th>
                  <th scope="colgroup" rowspan="2" colspan="2">HARGA / KEMASAN (BENTUK)</th>
                  <th scope="colgroup" rowspan="2" colspan="2">
                    HARGA KOMPARASI / SATUAN MATERIAL
                  </th>
                </tr>
                <tr>
                  <th scope="colgroup" colspan="2">VOLUME</th>
                  <th scope="colgroup" colspan="2">BERAT</th>
                  <th scope="colgroup" colspan="2">LUAS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(material, index) in paginatedMaterials" :key="material.id">
                  <td>{{ (currentPage - 1) * ITEMS_PER_PAGE + index + 1 }}</td>
                  <td>
                    <div class="material-actions">
                      <button
                        class="btn material-action"
                        type="button"
                        @click="openEditPanel(material)"
                      >
                        Edit
                      </button>
                      <button
                        class="btn material-action material-action--danger"
                        type="button"
                        @click="deleteMaterial(material)"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                  <td>Cat</td>
                  <td>{{ material.jenis }}</td>
                  <td class="material-table__photo">
                    <img
                      v-if="material.foto"
                      :src="material.foto"
                      :alt="'Foto cat ' + material.merek"
                    />
                  </td>
                  <td>{{ material.merek }}</td>
                  <td>{{ material.subMerek }}</td>
                  <td>{{ material.kodeWarna }}</td>
                  <td>{{ material.warna }}</td>
                  <td>{{ material.bentuk || '' }}</td>
                  <td>{{ material.kemasan }}</td>
                  <td class="text-end">
                    {{ material.beratTotalKg ? formatNumber(material.beratTotalKg) : '' }}
                  </td>
                  <td>{{ material.beratTotalKg ? 'Kg' : '' }}</td>
                  <td class="text-end">
                    {{ material.isiSatuan === 'L' ? formatNumber(material.isiNilai) : '' }}
                  </td>
                  <td>{{ material.isiSatuan === 'L' ? 'L' : '' }}</td>
                  <td class="text-end">
                    {{ weightKg(material) ? formatNumber(weightKg(material)) : '' }}
                  </td>
                  <td>{{ weightKg(material) ? 'Kg' : '' }}</td>
                  <td class="text-end">{{ material.luas ? formatNumber(material.luas) : '' }}</td>
                  <td>{{ material.luas ? material.satuanLuas || 'M2' : '' }}</td>
                  <td>{{ material.toko }}</td>
                  <td class="material-table__address">{{ material.alamat }}</td>
                  <td class="text-end">{{ formatCurrency(material.hargaKemasan) }}</td>
                  <td>/ {{ material.kemasan }}</td>
                  <td class="text-end">{{ formatCurrency(pricePerKg(material)) }}</td>
                  <td>/ Kg</td>
                </tr>
                <tr v-if="!filteredMaterials.length">
                  <td class="material-empty" colspan="25">
                    {{ materials.length ? 'Data cat tidak ditemukan.' : 'Belum ada data cat.' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <nav v-if="totalPages > 1" class="material-pagination" aria-label="Halaman data cat">
            <button
              class="btn material-secondary"
              type="button"
              :disabled="currentPage === 1"
              @click="currentPage -= 1"
            >
              Sebelumnya
            </button>
            <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
            <button
              class="btn material-secondary"
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

    <dialog
      ref="materialDialog"
      class="sheet-dialog"
      aria-labelledby="material-form-title"
      @cancel.prevent="closePanel"
      @click="closeOnBackdrop"
    >
      <h2 id="material-form-title" class="sheet-title">
        {{ editingId ? 'Edit Material CAT' : 'Tambah Material CAT' }}
      </h2>

      <form class="sheet-form" @submit.prevent="saveMaterial">
        <p v-if="formError" class="sheet-error" role="alert">{{ formError }}</p>

        <div class="sheet-fields">
          <div class="sheet-row">
            <label for="paint-type">Jenis</label>
            <input
              id="paint-type"
              v-model.trim="form.jenis"
              list="type-suggestions"
              required
              autofocus
            />
            <datalist id="type-suggestions">
              <option v-for="item in typeOptions" :key="item" :value="item"></option>
            </datalist>
          </div>

          <div class="sheet-row">
            <label for="paint-brand">Merek</label>
            <input id="paint-brand" v-model.trim="form.merek" list="brand-suggestions" required />
            <datalist id="brand-suggestions">
              <option v-for="item in brandOptions" :key="item" :value="item"></option>
            </datalist>
          </div>

          <div class="sheet-row">
            <label for="paint-subbrand">Sub Merek</label>
            <input id="paint-subbrand" v-model.trim="form.subMerek" list="subbrand-suggestions" />
            <datalist id="subbrand-suggestions">
              <option v-for="item in subBrandSuggestions" :key="item" :value="item"></option>
            </datalist>
          </div>

          <div class="sheet-row">
            <label for="paint-color">Warna</label>
            <input
              id="paint-color"
              v-model="colorInput"
              list="color-suggestions"
              title="Pilih warna dari merek, atau ketik kode - nama warna"
            />
            <datalist id="color-suggestions">
              <option v-for="item in colorSuggestions" :key="item" :value="item"></option>
            </datalist>
          </div>

          <div class="sheet-row">
            <label for="paint-volume">Volume Isi</label>
            <div class="sheet-pair">
              <input
                id="paint-volume"
                v-model.number="form.isiNilai"
                class="sheet-number"
                type="number"
                min="0.01"
                step="0.01"
                required
              />
              <select v-model="form.isiSatuan" aria-label="Satuan volume isi" required>
                <option value="L">L</option>
                <option value="kg">Kg</option>
              </select>
            </div>
          </div>

          <div class="sheet-row">
            <label for="paint-package">Kemasan</label>
            <div class="sheet-pair">
              <input
                id="paint-package"
                v-model.trim="form.kemasan"
                list="package-suggestions"
                required
                @input="updatePackagingWeight"
              />
              <div class="sheet-weight">
                <input
                  v-model.number="form.beratTotalKg"
                  class="sheet-number"
                  aria-label="Berat total termasuk kemasan (kg)"
                  title="Berat total cat termasuk kemasan"
                  type="number"
                  min="0.01"
                  step="0.01"
                  :required="form.isiSatuan === 'L'"
                />
                <span>Kg</span>
              </div>
            </div>
            <datalist id="package-suggestions">
              <option v-for="item in packageOptions" :key="item" :value="item"></option>
            </datalist>
          </div>

          <div v-if="form.isiSatuan === 'L' && knownPackaging === null" class="sheet-row">
            <label for="paint-package-weight">Berat Kemasan Kosong</label>
            <div class="sheet-weight">
              <input
                id="paint-package-weight"
                v-model.number="form.beratKemasanKg"
                class="sheet-number"
                type="number"
                min="0"
                step="0.01"
                required
              />
              <span>Kg</span>
            </div>
          </div>

          <div class="sheet-row">
            <label for="paint-price">Harga</label>
            <div class="sheet-pair sheet-price">
              <div class="sheet-money">
                <span>Rp</span>
                <input
                  id="paint-price"
                  v-model.number="form.hargaKemasan"
                  class="sheet-number"
                  type="number"
                  min="1"
                  step="1"
                  required
                />
                <span class="sheet-slash">/</span>
              </div>
              <input :value="form.kemasan" aria-label="Satuan harga" readonly />
            </div>
          </div>

          <div class="sheet-row">
            <label for="paint-comparison">Harga Komparasi<br />/ Satuan Material</label>
            <div class="sheet-pair sheet-price">
              <div class="sheet-money">
                <span>Rp</span>
                <output
                  id="paint-comparison"
                  class="sheet-number"
                  aria-live="polite"
                  :title="
                    formWeightKg ? 'Berat pembanding: ' + formatNumber(formWeightKg) + ' kg' : ''
                  "
                  >{{ formComparisonPrice ? formatNumber(formComparisonPrice) : '' }}</output
                >
                <span class="sheet-slash">/</span>
              </div>
              <input value="Kg" aria-label="Satuan harga komparasi" readonly />
            </div>
          </div>

          <div class="sheet-row">
            <label for="paint-store">Toko</label>
            <input
              id="paint-store"
              v-model.trim="form.toko"
              list="store-suggestions"
              required
              @input="updateStoreAddress"
            />
            <datalist id="store-suggestions">
              <option v-for="item in storeOptions" :key="item" :value="item"></option>
            </datalist>
          </div>

          <div class="sheet-row">
            <label for="paint-address">Alamat Singkat</label>
            <input
              id="paint-address"
              v-model.trim="form.alamat"
              list="address-suggestions"
              required
            />
            <datalist id="address-suggestions">
              <option v-for="item in addressSuggestions" :key="item" :value="item"></option>
            </datalist>
          </div>
        </div>

        <div class="sheet-side">
          <div class="sheet-photo" role="img" aria-label="Foto material cat">
            <img v-if="form.foto" :src="form.foto" alt="Foto material cat" />
          </div>
          <div class="sheet-photo-actions">
            <input
              ref="photoInput"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              hidden
              @change="selectPhoto"
            />
            <button type="button" @click="photoInput.click()">
              <span aria-hidden="true">^</span> Upload
            </button>
            <button type="button" @click="removePhoto">
              <span aria-hidden="true">X</span> Hapus
            </button>
          </div>
          <div class="sheet-actions">
            <button type="button" @click="closePanel">
              <span aria-hidden="true">X</span> Batalkan
            </button>
            <button class="sheet-save" type="submit" :disabled="photoLoading || saving">
              <span aria-hidden="true">V</span> {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  </main>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { API_URL } from '../config/api'
import { useRouter } from 'vue-router'
import { comparisonPricePerKg, comparisonWeightKg } from '../utils/materialPricing'
import { formatMaterialColor, parseMaterialColor } from '../utils/materialColor'

const ITEMS_PER_PAGE = 8
const router = useRouter()
const materials = ref([])
const loading = ref(true)
const saving = ref(false)
const deletingId = ref(null)
const loadError = ref('')
const materialDialog = ref(null)
const photoInput = ref(null)
const photoLoading = ref(false)
const colorInput = ref('')
let photoReader = null
const editingId = ref(null)
const formError = ref('')
const currentPage = ref(1)
const filters = reactive({ search: '', jenis: '', merek: '', sort: 'source' })
const emptyForm = () => ({
  jenis: '',
  merek: '',
  subMerek: '',
  kodeWarna: '',
  warna: '',
  bentuk: '',
  luas: null,
  satuanLuas: '',
  kemasan: 'Galon',
  isiNilai: '',
  isiSatuan: 'L',
  beratTotalKg: '',
  beratKemasanKg: 0.2,
  hargaKemasan: '',
  toko: '',
  alamat: '',
  foto: '',
})
const form = reactive(emptyForm())

function uniqueValues(field, rows = materials.value) {
  return [...new Set(rows.map((item) => item[field]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'id'),
  )
}

const typeOptions = computed(() => uniqueValues('jenis'))
const brandOptions = computed(() => uniqueValues('merek'))
const storeOptions = computed(() => uniqueValues('toko'))
const packageOptions = computed(() => [...new Set(['Galon', 'Pail', ...uniqueValues('kemasan')])])
const knownPackaging = computed(() => {
  const name = form.kemasan.toLowerCase()
  if (name === 'galon') return 0.2
  if (name === 'pail') return 1
  return materials.value.find((item) => item.kemasan.toLowerCase() === name)?.beratKemasanKg ?? null
})
const sameBrandMaterials = computed(() =>
  materials.value.filter((item) => item.merek.toLowerCase() === form.merek.toLowerCase()),
)
const subBrandSuggestions = computed(() => uniqueValues('subMerek', sameBrandMaterials.value))
const colorSuggestions = computed(() => [
  ...new Set(sameBrandMaterials.value.map(formatMaterialColor).filter(Boolean)),
])
const addressSuggestions = computed(() =>
  uniqueValues(
    'alamat',
    materials.value.filter((item) => item.toko.toLowerCase() === form.toko.toLowerCase()),
  ),
)

const filteredMaterials = computed(() => {
  const search = filters.search.toLowerCase()
  const rows = materials.value.filter((item) => {
    const searchable = [
      item.merek,
      item.subMerek,
      item.kodeWarna,
      item.warna,
      item.kemasan,
      item.toko,
      item.alamat,
    ]
      .join(' ')
      .toLowerCase()
    return (
      searchable.includes(search) &&
      (!filters.jenis || item.jenis === filters.jenis) &&
      (!filters.merek || item.merek === filters.merek)
    )
  })

  if (filters.sort === 'source') return rows
  return [...rows].sort((a, b) => {
    if (filters.sort === 'price-desc') return pricePerKg(b) - pricePerKg(a)
    if (filters.sort === 'brand')
      return `${a.merek} ${a.subMerek}`.localeCompare(`${b.merek} ${b.subMerek}`, 'id')
    return pricePerKg(a) - pricePerKg(b)
  })
})

const cheapestMaterial = computed(() =>
  filteredMaterials.value.reduce(
    (cheapest, item) => (!cheapest || pricePerKg(item) < pricePerKg(cheapest) ? item : cheapest),
    null,
  ),
)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMaterials.value.length / ITEMS_PER_PAGE)),
)
const paginatedMaterials = computed(() =>
  filteredMaterials.value.slice(
    (currentPage.value - 1) * ITEMS_PER_PAGE,
    currentPage.value * ITEMS_PER_PAGE,
  ),
)
const formWeightKg = computed(() =>
  form.isiSatuan === 'L' && form.beratKemasanKg === '' ? 0 : comparisonWeightKg(form),
)
const formComparisonPrice = computed(() =>
  formWeightKg.value > 0 ? comparisonPricePerKg(form) : 0,
)

watch(
  () => [filters.search, filters.jenis, filters.merek, filters.sort],
  () => (currentPage.value = 1),
)
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})
function updatePackagingWeight() {
  form.beratKemasanKg = knownPackaging.value ?? ''
}

function updateStoreAddress() {
  form.alamat = addressSuggestions.value.length === 1 ? addressSuggestions.value[0] : ''
}

async function materialRequest(path = '', options = {}) {
  const response = await fetch(`${API_URL}/materials${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
  })
  const result = await response.json()
  if (response.status === 401) {
    localStorage.removeItem('token')
    router.replace('/login')
    throw new Error('Sesi berakhir. Silakan login kembali.')
  }
  if (!response.ok) throw new Error(result.message || 'Permintaan gagal. Coba lagi.')
  return result
}

async function loadMaterials() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await materialRequest()
    materials.value = result.data
  } catch (error) {
    loadError.value =
      error.message === 'Failed to fetch'
        ? 'Tidak dapat menghubungi server. Pastikan backend berjalan.'
        : error.message
  } finally {
    loading.value = false
  }
}
onMounted(loadMaterials)

function weightKg(material) {
  return material.beratIsiKg ?? comparisonWeightKg(material)
}
function pricePerKg(material) {
  return material.hargaKomparasi ?? comparisonPricePerKg(material)
}
function resetForm() {
  removePhoto()
  for (const key of Object.keys(form)) delete form[key]
  Object.assign(form, emptyForm())
  colorInput.value = ''
  formError.value = ''
}
function openCreatePanel() {
  editingId.value = null
  resetForm()
  materialDialog.value.showModal()
}
function openEditPanel(material) {
  editingId.value = material.id
  removePhoto()
  Object.assign(form, emptyForm(), material)
  colorInput.value = formatMaterialColor(material)
  formError.value = ''
  materialDialog.value.showModal()
}
function closePanel() {
  if (saving.value) return
  materialDialog.value.close()
  editingId.value = null
  resetForm()
}

function closeOnBackdrop(event) {
  if (event.target !== materialDialog.value) return
  const bounds = materialDialog.value.getBoundingClientRect()
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    closePanel()
}

async function saveMaterial() {
  formError.value = ''
  if (photoLoading.value || saving.value) return
  if (form.isiSatuan === 'L' && formWeightKg.value <= 0) {
    formError.value = 'Berat total harus lebih besar daripada berat kemasan kosong.'
    return
  }

  const wasEditing = Boolean(editingId.value)
  const material = {
    ...form,
    ...parseMaterialColor(colorInput.value, sameBrandMaterials.value),
    isiNilai: Number(form.isiNilai),
    beratTotalKg: Number(form.beratTotalKg) || 0,
    beratKemasanKg: Number(form.beratKemasanKg) || 0,
    hargaKemasan: Number(form.hargaKemasan),
  }
  saving.value = true
  try {
    const result = await materialRequest(wasEditing ? `/${editingId.value}` : '', {
      method: wasEditing ? 'PUT' : 'POST',
      body: JSON.stringify(material),
    })
    materials.value = wasEditing
      ? materials.value.map((item) => (item.id === result.data.id ? result.data : item))
      : [...materials.value, result.data]
  } catch (error) {
    formError.value =
      error.message === 'Failed to fetch'
        ? 'Data belum tersimpan. Tidak dapat menghubungi server.'
        : error.message
    return
  } finally {
    saving.value = false
  }
  closePanel()
  await Swal.fire({
    icon: 'success',
    title: wasEditing ? 'Data cat diperbarui' : 'Data cat ditambahkan',
    timer: 1300,
    showConfirmButton: false,
  })
}

async function deleteMaterial(material) {
  if (deletingId.value) return
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus data cat?',
    text: `${material.merek} ${material.subMerek} dari ${material.toko} akan dihapus.`,
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#b04b3f',
  })
  if (!result.isConfirmed) return
  deletingId.value = material.id
  try {
    await materialRequest(`/${material.id}`, { method: 'DELETE' })
    materials.value = materials.value.filter((item) => item.id !== material.id)
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Data belum dihapus', text: error.message })
  } finally {
    deletingId.value = null
  }
}

function selectPhoto(event) {
  const file = event.target.files[0]
  if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
    formError.value = 'Pilih foto PNG, JPEG, WebP, atau GIF.'
    event.target.value = ''
    return
  }
  if (file.size > 1024 * 1024) {
    formError.value = 'Ukuran foto maksimal 1 MB.'
    event.target.value = ''
    return
  }
  photoReader?.abort()
  photoReader = new FileReader()
  photoLoading.value = true
  photoReader.onload = () => {
    form.foto = photoReader.result
    formError.value = ''
    photoLoading.value = false
  }
  photoReader.onerror = () => {
    formError.value = 'Foto gagal dibaca. Coba pilih ulang.'
    photoLoading.value = false
  }
  photoReader.readAsDataURL(file)
}

function removePhoto() {
  photoReader?.abort()
  photoLoading.value = false
  form.foto = ''
  if (photoInput.value) photoInput.value.value = ''
}

function clearFilters() {
  Object.assign(filters, { search: '', jenis: '', merek: '', sort: 'source' })
}
function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}
function formatNumber(value) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value || 0)
}
function logout() {
  localStorage.removeItem('token')
  router.replace('/login')
}
</script>

<style scoped>
.material-page {
  display: flex;
  min-height: 100dvh;
  color: var(--tm-ink);
  background: #faf7f7;
}
.material-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex: 0 0 16.5rem;
  flex-direction: column;
  height: 100dvh;
  padding: 1.75rem 1.25rem;
  border-right: 1px solid var(--tm-border);
  background: #fff;
}
.material-brand {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--tm-ink);
  text-decoration: none;
}
.material-brand strong,
.material-brand small {
  display: block;
}
.material-brand strong {
  font-size: 1.15rem;
  letter-spacing: -0.03em;
}
.material-brand small,
.material-sidebar__note,
.material-heading > div > p:last-child,
.material-card__meta {
  color: var(--tm-muted);
}
.material-brand small {
  margin-top: 0.1rem;
  font-size: 0.73rem;
}
.material-brand__mark {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50% 50% 45% 55%;
  background: linear-gradient(145deg, #d00000 0 52%, #ef7777 52% 100%);
}
.material-nav {
  display: grid;
  gap: 0.35rem;
  margin-top: 4rem;
}
.material-nav__link {
  padding: 0.78rem 0.9rem;
  border-radius: 0.75rem;
  color: var(--tm-muted);
  font-size: 0.93rem;
  font-weight: 700;
  text-decoration: none;
}
.material-nav__link:hover,
.material-nav__link--active {
  color: var(--tm-primary-dark);
  background: var(--tm-primary-soft);
}
.material-sidebar__note {
  margin: auto 0 0;
  font-size: 0.8rem;
  line-height: 1.6;
}
.material-shell {
  min-width: 0;
  flex: 1;
}
.material-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 7.25rem;
  padding: 1.5rem clamp(1.25rem, 4vw, 4rem);
  border-bottom: 1px solid var(--tm-border);
  background: #fff;
}
.material-topbar__actions,
.material-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.material-eyebrow {
  margin: 0 0 0.3rem;
  color: var(--tm-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.material-topbar h1,
.material-heading h2 {
  margin: 0;
  font-weight: 750;
  letter-spacing: -0.04em;
}
.material-topbar h1 {
  font-size: clamp(1.65rem, 3vw, 2.1rem);
}
.material-content {
  max-width: 100rem;
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 3.5rem);
}
.material-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.material-heading h2 {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
}
.material-heading > div > p:last-child {
  margin: 0.55rem 0 0;
}
.material-primary,
.material-secondary {
  min-height: 2.65rem;
  padding-inline: 1rem;
  font-weight: 750;
}
.material-primary {
  border-color: var(--tm-primary);
  color: #fff;
  background: var(--tm-primary);
}
.material-primary:hover,
.material-primary:focus {
  border-color: var(--tm-primary-dark);
  color: #fff;
  background: var(--tm-primary-dark);
}
.material-secondary {
  border: 1px solid var(--tm-border);
  color: var(--tm-primary-dark);
  background: #fff;
}
.material-secondary:hover,
.material-secondary:focus {
  border-color: var(--tm-primary);
  color: var(--tm-primary-dark);
  background: var(--tm-primary-soft);
}
.material-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 1rem;
}
.material-stats article {
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.9rem;
  background: #fff;
}
.material-stats span,
.material-stats small {
  display: block;
  color: var(--tm-muted);
  font-size: 0.75rem;
}
.material-stats strong {
  display: block;
  margin: 0.2rem 0 0.1rem;
  font-size: 1.45rem;
  letter-spacing: -0.04em;
}
.material-stats__price {
  border-color: #efbcbc !important;
  background: #fff1f1 !important;
}
.material-card {
  overflow: hidden;
  border: 1px solid var(--tm-border);
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 1rem 2.5rem rgb(208 0 0 / 5%);
}
.material-filters {
  display: grid;
  grid-template-columns: minmax(15rem, 1.7fr) repeat(3, minmax(9rem, 1fr)) auto;
  gap: 0.85rem;
  align-items: end;
  padding: 1.25rem;
  border-bottom: 1px solid var(--tm-border);
}
.material-filters label span {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.78rem;
  font-weight: 750;
}
.material-filters :deep(.form-control),
.material-filters :deep(.form-select) {
  min-height: 2.75rem;
  border-color: var(--tm-border);
  box-shadow: none;
}
.material-filters :deep(.form-control:focus),
.material-filters :deep(.form-select:focus) {
  border-color: var(--tm-primary);
  box-shadow: 0 0 0 0.2rem rgb(208 0 0 / 13%);
}
.material-card__meta {
  display: flex;
  gap: 0.35rem;
  padding: 0.85rem 1.25rem;
  font-size: 0.83rem;
}
.material-table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
}
.material-table thead th {
  padding: 10px 12px;
  border: 1px solid var(--tm-border);
  color: var(--tm-ink);
  background: var(--tm-primary-soft);
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
}
.material-table tbody td {
  min-width: 42px;
  padding: 10px 12px;
  border: 1px solid var(--tm-border);
  color: var(--tm-ink);
  background: #fff;
  font-size: 13px;
  white-space: nowrap;
}
.material-table__photo {
  min-width: 70px !important;
}
.material-table__photo img {
  display: block;
  width: 56px;
  height: 56px;
  object-fit: contain;
}
.material-table tbody .material-table__address {
  min-width: 220px;
  max-width: 340px;
  white-space: normal;
}
.material-actions {
  justify-content: start;
}
.material-action {
  padding: 0.32rem 0.55rem;
  border: 1px solid var(--tm-border);
  color: var(--tm-primary-dark);
  background: #fff;
  font-size: 0.76rem;
  font-weight: 700;
}
.material-action:hover {
  border-color: var(--tm-primary);
  background: var(--tm-primary-soft);
}
.material-action--danger {
  color: #934338;
}
.material-empty {
  padding: 3rem 1.25rem !important;
  text-align: center;
}
.material-empty strong,
.material-empty span {
  display: block;
}
.material-empty strong {
  color: var(--tm-ink);
}
.material-empty span {
  margin-top: 0.3rem;
}
.material-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--tm-border);
  color: var(--tm-muted);
  font-size: 0.82rem;
}
.sheet-dialog {
  position: fixed;
  inset: 0;
  width: 856px;
  max-width: calc(100vw - 32px);
  max-height: calc(100dvh - 32px);
  margin: auto;
  padding: 24px;
  overflow: auto;
  border: 1px solid #c9c9c9;
  border-radius: 0;
  color: #000;
  background: #eee;
  font-family: Arial, sans-serif;
  font-size: 13px;
}

.sheet-dialog::backdrop {
  background: rgb(0 0 0 / 35%);
}

.sheet-title {
  margin: 0 0 34px;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
}

.sheet-form {
  display: grid;
  grid-template-columns: minmax(0, 489fr) minmax(0, 294fr);
  gap: 20px;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0 40px,
    #d7d7d7 40px 41px,
    transparent 41px 50px
  );
}

.sheet-fields {
  display: grid;
  gap: 9px;
}

.sheet-row {
  display: grid;
  grid-template-columns: 125px minmax(0, 1fr);
  align-items: center;
  min-height: 41px;
}

.sheet-row > label {
  padding-right: 8px;
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
}

.sheet-row input,
.sheet-row select,
.sheet-row output {
  display: block;
  width: 100%;
  min-width: 0;
  height: 41px;
  margin: 0;
  padding: 4px;
  border: 1px solid #000;
  border-radius: 0;
  color: #000;
  background: #fff;
  font: inherit;
}

.sheet-row output {
  line-height: 31px;
}

.sheet-row input:focus,
.sheet-row select:focus,
.sheet-form button:focus-visible {
  outline: 2px solid #d00000;
  outline-offset: 2px;
}

.sheet-number {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.sheet-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 11px;
}

.sheet-weight {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 4px;
}

.sheet-weight > span {
  flex: none;
}

.sheet-money {
  position: relative;
  display: grid;
  grid-template-columns: 25px minmax(0, 1fr);
  align-items: center;
}

.sheet-slash {
  position: absolute;
  right: -8px;
}

.sheet-side {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sheet-photo {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid #000;
  background: #fff;
}

.sheet-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sheet-photo-actions,
.sheet-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.sheet-photo-actions {
  margin-top: 9px;
}

.sheet-form button {
  min-width: 0;
  height: 41px;
  padding: 6px 8px;
  border: 0;
  border-radius: 0;
  color: #f00;
  background: transparent;
  font: inherit;
}

.sheet-form button span {
  margin-right: 4px;
}

.sheet-form button:hover {
  background: #e0e0e0;
}

.sheet-actions {
  margin-top: auto;
  padding-top: 20px;
}

.sheet-form .sheet-save {
  color: #fff;
  background: #d00000;
  font-weight: 700;
}

.sheet-form .sheet-save:hover {
  background: #b00000;
}

.sheet-form .sheet-save:disabled {
  opacity: 0.6;
}

.sheet-error {
  grid-column: 1 / -1;
  margin: 0;
  color: #a00000;
}

:global(body:has(.sheet-dialog[open])) {
  overflow: hidden;
}

@media (max-width: 700px) {
  .sheet-dialog {
    max-width: calc(100vw - 16px);
    max-height: calc(100dvh - 16px);
    padding: 16px;
  }

  .sheet-title {
    margin-bottom: 24px;
  }

  .sheet-form {
    grid-template-columns: 1fr;
  }

  .sheet-row {
    grid-template-columns: 104px minmax(0, 1fr);
  }

  .sheet-pair {
    gap: 10px;
  }

  .sheet-photo {
    max-width: 294px;
    align-self: center;
  }

  .sheet-actions {
    margin-top: 24px;
    padding-top: 0;
  }
}
@media (max-width: 1199.98px) {
  .material-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .material-search {
    grid-column: span 2;
  }
}
@media (max-width: 991.98px) {
  .material-sidebar {
    display: none;
  }
}
@media (max-width: 767.98px) {
  .material-topbar,
  .material-heading {
    align-items: flex-start;
  }
  .material-topbar {
    min-height: auto;
  }
  .material-heading {
    flex-direction: column;
  }
  .material-stats {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 575.98px) {
  .material-topbar,
  .material-content {
    padding-inline: 1rem;
  }
  .material-topbar {
    gap: 1rem;
  }
  .material-topbar__actions .material-secondary:first-child {
    display: none;
  }
  .material-filters {
    grid-template-columns: 1fr;
  }
  .material-search {
    grid-column: auto;
  }
  .material-reset {
    width: 100%;
  }
  .material-pagination {
    align-items: stretch;
    flex-direction: column;
    gap: 0.65rem;
    text-align: center;
  }
}
</style>
