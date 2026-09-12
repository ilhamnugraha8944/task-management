# Taskboard

Taskboard adalah aplikasi task management sederhana untuk membuat, melihat, memfilter, mengubah, dan menghapus tugas pribadi. Backend menggunakan Express, MySQL, bcrypt, dan JWT. Frontend menggunakan Vue 3, Vue Router, Bootstrap, dan SweetAlert2.

## Struktur proyek

```text
backend/
  src/
    config/database.js
    controllers/
    database/schema.sql
    middleware/
    repository/
    routes/route.js
    server.js
frontend/
  src/
    views/
    router/
```

## Requirement

- Node.js 22 atau lebih baru.
- npm.
- MySQL 8 atau Docker Desktop.

## Running DB

Jalankan Docker:

```bash
copy .env.example .env
docker compose up -d mysql
```

Pada macOS/Linux, gunakan `cp .env.example .env`.

Salin konfigurasi backend:

```bash
cd backend
copy .env.example .env
```

Pada macOS/Linux, gunakan `cp .env.example .env` dari dalam folder `backend`.

Jalankan migrasi schema ke database `task_management`:

```bash
docker exec -i task-management-mysql mysql --host=127.0.0.1 --user=task_user --password=change-this-local-password task_management < backend/src/database/schema.sql
```

Ganti `task_user`, password, dan nama database pada command tersebut jika Anda mengubah nilai di root `.env`. Pada PowerShell, gunakan:

```powershell
Get-Content -Raw .\backend\src\database\schema.sql |
  docker exec -i task-management-mysql mysql --host=127.0.0.1 --user=task_user --password=change-this-local-password task_management
```

Jika database container sudah pernah dibuat dengan password lama, mengganti nilai environment tidak otomatis mengubah password pada volume MySQL yang sudah ada. Sesuaikan password user MySQL atau buat ulang volume hanya jika data lokal boleh dihapus.

Jika memakai MySQL lokal, buat database sesuai `DB_NAME` lalu jalankan file `backend/src/database/schema.sql` menggunakan MySQL client.

## Menjalankan backend

```bash
cd backend
npm install
npm run dev
```

Backend berjalan di `http://localhost:3000`.

Endpoint pengecekan:

```http
GET /api/health
```

## Menjalankan test backend

Test endpoint berjalan tanpa koneksi ke MySQL karena repository di-mock:

```bash
cd backend
npm test
```

## Menjalankan frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

## Environment variables

Gunakan `backend/.env.example` sebagai template. Salin menjadi `backend/.env`, lalu sesuaikan nilainya.

| Variable | Keterangan |
| --- | --- |
| `PORT` | Port backend, default `3000`. |
| `FRONTEND_URL` | Origin frontend yang diizinkan CORS. |
| `DB_HOST` | Host MySQL. |
| `DB_PORT` | Port MySQL. |
| `DB_NAME` | Nama database. |
| `DB_USER` | User MySQL. |
| `DB_PASSWORD` | Password MySQL. |
| `JWT_SECRET` | Secret untuk menandatangani JWT; gunakan nilai acak yang panjang. |
| `JWT_EXPIRES_IN` | Masa berlaku JWT, misalnya `1h`. |

## API utama

Register dan login tidak membutuhkan token:

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullname": "Nama Pengguna"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Login mengembalikan JWT. Gunakan token tersebut pada endpoint task:

```http
Authorization: Bearer <token>
```

Endpoint task:

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/api/tasks` | Daftar task milik user login. |
| `GET` | `/api/tasks?status=done` | Daftar task dengan filter status. |
| `POST` | `/api/tasks` | Membuat task baru. |
| `PUT` | `/api/tasks/:id` | Mengubah task milik user login. |
| `DELETE` | `/api/tasks/:id` | Menghapus task milik user login. |

Body untuk membuat atau mengubah task:

```json
{
  "title": "Selesaikan laporan",
  "description": "Deskripsi opsional",
  "status": "pending",
  "deadline": "2026-09-20"
}
```

Nilai `status` yang tersedia: `pending`, `in-progress`, dan `done`. Field `title` wajib; `description` dan `deadline` opsional. Deadline memakai format `YYYY-MM-DD`.

## Dokumentasi API

Postman collection tersedia di [docs/postman/Taskboard.postman_collection.json](docs/postman/Taskboard.postman_collection.json).

Import file tersebut ke Postman, jalankan `Auth > Register` (jika user belum ada), lalu `Auth > Login`. Script pada request login akan menyimpan JWT ke collection variable `token`, sehingga request pada folder `Tasks` dapat langsung digunakan. Isi variable `taskId` dengan ID task dari response `List Tasks` sebelum menjalankan request edit atau delete.

