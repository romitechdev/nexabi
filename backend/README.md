# NexaBI Backend API Service

Backend API untuk platform analitik customer segmentation berbasis FastAPI, PostgreSQL, dan JWT authentication. Proyek ini menyediakan fitur registrasi/login pengguna, CRUD data customer cluster, serta endpoint ringkasan analytics untuk mendukung dashboard bisnis.

## Deskripsi

NexaBI Backend adalah service REST API yang:

- mengelola autentikasi pengguna dengan JWT bearer token
- menyajikan data customer segmentation hasil clustering
- mendukung operasi CRUD untuk data customer
- melakukan seeding otomatis dari file CSV saat aplikasi start
- siap dijalankan secara lokal maupun melalui Docker Compose

## Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy
- Pandas
- JWT dengan `python-jose`
- Password hashing dengan `passlib`
- Docker dan Docker Compose

## Fitur

- Registrasi user
- Login user dengan OAuth2 password flow
- Proteksi endpoint menggunakan JWT
- Ringkasan analytics cluster customer
- Analisis Market Basket (Association Rules Apriori)
- Fitur AI (Insight, Churn Risk AI, Sales Forecast, Chatbot)
- List, tambah, ubah, dan hapus data customer
- Auto seed data dari `df_kmeans.csv` dan `association_rules.csv`
- Konfigurasi melalui environment variables

## Struktur Project

```text
.
├── app/
│   ├── auth.py
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── seeder.py
├── df_kmeans.csv
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── .env.example
└── README.md
```

## Environment Variables

Salin `.env.example` menjadi `.env` lalu sesuaikan nilainya.

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/nexabi_db
SECRET_KEY=change-this-secret-before-deploy
CSV_FILE_PATH=df_kmeans.csv
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nexabi_db
CLOUDFLARE_TUNNEL_TOKEN=
```

### Keterangan

- `DATABASE_URL`: koneksi database PostgreSQL
- `SECRET_KEY`: secret untuk signing JWT
- `CSV_FILE_PATH`: lokasi file CSV untuk seeding data awal
- `CORS_ORIGINS`: daftar origin frontend yang diizinkan, dipisah koma
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: dipakai oleh service PostgreSQL di Docker Compose
- `CLOUDFLARE_TUNNEL_TOKEN`: token tunnel Cloudflare kalau kamu mau publish backend lewat tunnel di stack yang sama

## Instalasi Lokal

### 1. Clone repository

```bash
git clone <url-repository>
cd nexa-bi-backend
```

### 2. Buat virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3. Install dependency

```bash
pip install -r requirements.txt
```

### 4. Siapkan file environment

```bash
cp .env.example .env
```

Lalu sesuaikan `DATABASE_URL` dan `SECRET_KEY` jika diperlukan.

### 5. Jalankan aplikasi

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

Aplikasi akan otomatis:

- membuat tabel database
- melakukan seed data dari CSV
- menyalakan API di port `5000`

## Menjalankan dengan Docker

### Build dan run

```bash
docker compose up --build
```

### Stop service

```bash
docker compose down
```

## Auto Start Saat VM Boot

Kalau VM mati karena listrik padam, kamu bisa bikin satu stack Docker yang isinya database, API, dan Cloudflare Tunnel otomatis naik lagi saat mesin hidup dengan systemd.

### 1. Pastikan Docker aktif saat boot

```bash
sudo systemctl enable docker
```

### 2. Pasang unit systemd backend

Copy file [nexabi-backend.service](nexabi-backend.service) ke `/etc/systemd/system/`:

```bash
sudo cp nexabi-backend.service /etc/systemd/system/nexabi-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now nexabi-backend
```

### 3. Cek status

```bash
sudo systemctl status nexabi-backend
```

Kalau kamu memakai Cloudflare Tunnel, isi `CLOUDFLARE_TUNNEL_TOKEN` di `.env`, lalu tunnel akan ikut hidup sebagai container di stack yang sama.

## API Documentation

Setelah aplikasi berjalan, Swagger UI tersedia di:

- `http://localhost:5000/docs`

ReDoc tersedia di:

- `http://localhost:5000/redoc`

## Endpoint API Lengkap

### Authentication
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login, return JWT token |

### Analytics
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/analytics/overview` | KPI ringkasan (total, loyal, pasif, avg monetary) |
| GET | `/api/analytics/rfm-scatter` | Data scatter plot RFM semua pelanggan |
| GET | `/api/analytics/segment-stats` | Statistik per segment |
| GET | `/api/analytics/top-customers` | Top 10 pelanggan by monetary |
| GET | `/api/analytics/churn-risk` | Daftar pelanggan berisiko churn |
| GET | `/api/analytics/market-basket` | Association rules Apriori |
| GET | `/api/analytics/sales-performance` | Revenue, orders, distribusi per segment |

### AI Features
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/analytics/ai-insight` | Generate AI insight dari data overview |
| GET | `/api/analytics/churn-ai` | Analisis churn + strategi retensi AI |
| GET | `/api/analytics/sales-forecast` | Proyeksi penjualan bulan depan |
| POST | `/api/analytics/chat` | Chatbot interaktif kontekstual |

### Customer CRUD
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/customers` | List semua customer |
| POST | `/api/customers` | Tambah customer baru |
| PUT | `/api/customers/{customer_id}` | Update data customer |
| DELETE | `/api/customers/{customer_id}` | Hapus customer |

> Semua endpoint kecuali auth membutuhkan header: `Authorization: Bearer <token>`

## Alur Penggunaan API

1. Register user baru melalui `/api/auth/register`
2. Login melalui `/api/auth/login`
3. Salin `access_token` dari response login
4. Gunakan token tersebut pada header `Authorization: Bearer <token>`
5. Akses endpoint analytics dan customer CRUD

## Contoh Request dengan cURL

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"adminuser","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=adminuser&password=password123"
```

### Get Overview

```bash
curl -X GET http://localhost:5000/api/analytics/overview \
  -H "Authorization: Bearer <jwt-token>"
```

### Get Customers

```bash
curl -X GET http://localhost:5000/api/customers \
  -H "Authorization: Bearer <jwt-token>"
```

## Catatan Deployment

- Jangan commit file `.env` ke repository publik.
- Gunakan `SECRET_KEY` yang kuat dan unik untuk production.
- Pastikan database PostgreSQL dapat diakses oleh service backend.
- Jika frontend berjalan di domain berbeda, tambahkan origin-nya ke `CORS_ORIGINS`.

## Lisensi

Belum ditentukan.
