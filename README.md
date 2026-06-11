# NexaBI — Next-Generation Business Intelligence Platform

Platform analitik bisnis berbasis AI untuk customer analytics dan product recommendation pada industri retail. Dibangun di atas dataset Global Superstore (51.290 transaksi, 2012–2015).

**Capstone Project — PJK-GM040 | Pijak × IBM SkillsBuild**  
Tema: *AI for Business Intelligence and Market Insights*

---

## Fitur Utama

| Halaman | Deskripsi |
|---|---|
| **Overview** | KPI ringkasan, distribusi cluster Loyal/Pasif, AI Smart Advisor |
| **Sales Performance** | Revenue per segment, distribusi monetary, recency, pareto kontribusi, AI Sales Forecast |
| **Analytics** | RFM Scatter Plot, distribusi segment, % loyal, tabel detail RFM |
| **Market Basket** | Association rules Apriori (106 rules), top bundling ideas |
| **Top Customers** | Podium top 3 + ranked table 10 pelanggan tertinggi |
| **Churn Risk** | Monitor pelanggan berisiko churn + AI strategi retensi |
| **Customers** | CRUD lengkap, search, pagination, export CSV |
| **AI Chatbot** | Floating chatbot kontekstual di semua halaman dashboard |

---

## Struktur Project

```text
.
├── backend/
│   ├── app/
│   │   ├── ai_helper.py       # OpenAI-compatible AI client
│   │   ├── ai_routes.py       # Endpoint AI: insight, chat, forecast
│   │   ├── analytics_routes.py # Endpoint analytics extended
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── seeder.py
│   ├── df_kmeans.csv              # Data RFM hasil K-Means (1.590 pelanggan)
│   ├── association_rules.csv      # 106 association rules hasil Apriori
│   ├── Market Basket Analysis (Apriori).ipynb
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── pages/             # 9 halaman dashboard
    │   ├── components/        # Sidebar, ChatbotWidget, dll
    │   ├── layouts/
    │   └── api/axios.js       # Axios + JWT interceptor
    ├── package.json
    └── vite.config.js
```

---

## Prasyarat

- Docker & Docker Compose (direkomendasikan)
- Atau: Python 3.10+, Node.js 20+, PostgreSQL 15

---

## Jalankan dengan Docker (Direkomendasikan)

### 1. Buat network Docker

```bash
docker network create nexabi_shared_net
```

### 2. Jalankan backend (FastAPI + PostgreSQL)

```bash
cd backend
docker compose up --build -d
```

Backend tersedia di `http://localhost:5000`  
Swagger docs: `http://localhost:5000/docs`

### 3. Jalankan frontend (React + Nginx)

```bash
cd frontend
docker compose up --build -d
```

Frontend tersedia di `http://localhost:3000`

---

## Jalankan Tanpa Docker

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # sesuaikan DATABASE_URL dan SECRET_KEY
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

### Frontend

```bash
cd frontend
npm install
# Buat .env untuk arahkan ke backend lokal:
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
npm run dev
```

---

## Environment Variables (backend/.env)

| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | Koneksi PostgreSQL |
| `SECRET_KEY` | Secret untuk signing JWT |
| `CSV_FILE_PATH` | Path file CSV data RFM (default: `df_kmeans.csv`) |
| `CORS_ORIGINS` | Origin frontend yang diizinkan (pisah koma) |
| `OPENAI_BASE_URL` | Base URL OpenAI-compatible API untuk AI features |
| `OPENAI_API_KEY` | API key untuk AI service |
| `OPENAI_MODEL` | Nama model yang digunakan |
| `GEMINI_API_KEY` | (Opsional) Gemini API key |

---

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

---

## Auto-Start dengan Systemd (VPS/VM)

```bash
sudo cp backend/nexabi-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now nexabi-backend
```

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Recharts, Lucide |
| Backend | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| Database | PostgreSQL 15 |
| ML | Scikit-learn (K-Means), MLxtend (Apriori) |
| AI | OpenAI-compatible API (Qwen/LLM) |
| DevOps | Docker, Docker Compose, Nginx, Systemd |

---

## Dataset

**Global Superstore Sales Dataset** — Kaggle (CC0: Public Domain)  
51.290 baris, 24 kolom, periode 2012–2015  
[kaggle.com/datasets/apoorvaappz/global-super-store-dataset](https://kaggle.com/datasets/apoorvaappz/global-super-store-dataset)

---

## Tim

**ID Tim:** PJK-GM040 | Pijak × IBM SkillsBuild

| Nama | Learning Path | Tanggung Jawab |
|---|---|---|
| Michael Sanjaya | Machine Learning | Data collection, cleaning, EDA, preprocessing pipeline |
| Irisaliya Irhabiyah Banat | Machine Learning | Feature engineering, K-Means clustering, Apriori MBA, evaluasi model |
| Muhromin | Backend | REST API, database, autentikasi |
| Ahmad Fauzul Adhim | Frontend | UI/UX dashboard, chart interaktif, responsivitas |
| Muhammad Daffa Amrullah | DevOps | CI/CD, Docker, deploy cloud, dokumentasi teknis |
