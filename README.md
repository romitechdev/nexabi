# NexaBI

NexaBI adalah aplikasi dashboard analitik customer segmentation dengan backend FastAPI dan frontend React + Vite. Repo ini disiapkan sebagai satu project utuh, jadi backend dan frontend dijalankan dari folder masing-masing.

## Struktur

```text
.
├── backend/
│   ├── app/
│   ├── df_kmeans.csv
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    ├── package.json
    └── vite.config.js
```

## Prasyarat

- Python 3.11 atau lebih baru
- Node.js 20 atau lebih baru
- PostgreSQL 15 jika menjalankan backend tanpa Docker
- Docker dan Docker Compose jika ingin menjalankan semua service lewat container

## File Environment

File `backend/.env` sudah disiapkan di workspace untuk keperluan lokal dan tidak akan ikut ter-push karena sudah di-ignore.

Jika ingin frontend mengarah ke backend lokal, buat file `frontend/.env` dengan isi:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Jalankan Dengan Docker

Backend memakai `backend/docker-compose.yml` dan mengharuskan network eksternal `nexabi_shared_net` sudah ada.

### 1. Siapkan network Docker

```bash
docker network create nexabi_shared_net
```

### 2. Jalankan backend

```bash
cd backend
docker compose up --build
```

Backend akan tersedia di `http://localhost:5000` dan dokumentasi Swagger di `http://localhost:5000/docs`.

### 3. Jalankan frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`.

## Jalankan Tanpa Docker

### 1. Backend

Masuk ke folder backend, lalu install dependency:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Pastikan file `.env` sudah ada di folder backend. Contoh isi utamanya:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexabi_db
SECRET_KEY=change-this-secret-before-deploy
CSV_FILE_PATH=df_kmeans.csv
CORS_ORIGINS=http://localhost:5173
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nexabi_db
GEMINI_API_KEY=
```

Jalankan backend:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

### 2. Frontend

Masuk ke folder frontend dan install dependency:

```bash
cd frontend
npm install
```

Jika backend dijalankan secara lokal, buat `frontend/.env` seperti contoh di atas agar frontend memakai API lokal. Setelah itu jalankan:

```bash
npm run dev
```

## Alur Login dan Akses Aplikasi

1. Buka frontend di browser.
2. Registrasi akun baru atau login menggunakan akun yang sudah ada.
3. Setelah login, aplikasi akan menyimpan token JWT di browser.
4. Dashboard, analytics, customer list, dan fitur lain akan memakai token tersebut secara otomatis.

## Endpoint Penting Backend

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/analytics/overview`
- `GET /api/customers`
- `POST /api/customers`
- `PUT /api/customers/{customer_id}`
- `DELETE /api/customers/{customer_id}`

## Catatan Penting

- Jangan commit file `.env` ke GitHub.
- Jika mengubah `SECRET_KEY`, gunakan nilai yang kuat untuk production.
- Jika frontend dan backend berjalan di host berbeda, sesuaikan `CORS_ORIGINS`.
- Jika ingin memakai API backend lokal dari frontend, pastikan `VITE_API_BASE_URL` diarahkan ke `http://localhost:5000/api`.
