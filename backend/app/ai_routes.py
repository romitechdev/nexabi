from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import requests

from app.database import get_db
from app.models import CustomerCluster, User
from app.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["AI Features"])

OLLAMA_BASE_URL   = "http://192.168.10.16:11434"
OLLAMA_MODEL      = "llama3.1:8b"
MAX_TOKENS_INSIGHT = 350   # ~250 kata untuk insight
MAX_TOKENS_CHAT    = 200   # ~150 kata untuk chat

SYSTEM_INSTRUCTION = """Kamu adalah NexaBI Smart Advisor, analis bisnis retail profesional.
Aturan WAJIB:
- Bahasa Indonesia, profesional dan ringkas
- Format Markdown (heading ##, bullet - , **bold**)
- MAKSIMAL 150 kata total — padat, tajam, tidak bertele-tele
- Berikan tepat 3 rekomendasi aksi konkret
- Langsung ke poin, tanpa basa-basi pembuka"""


def call_ollama(prompt: str, max_tokens: int = MAX_TOKENS_INSIGHT) -> str:
    """Kirim prompt ke Ollama dan kembalikan teks jawaban."""
    try:
        resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": max_tokens,  # hard limit jumlah token
                    "temperature": 0.7,
                    "top_p": 0.9,
                },
            },
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Tidak bisa terhubung ke Ollama. Pastikan server Ollama berjalan.")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Ollama timeout. Coba lagi beberapa saat.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses AI: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 1: GET /api/analytics/ai-insight
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/ai-insight")
def get_ai_insight(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mengambil agregasi data dari PostgreSQL, lalu mengirimkannya ke Ollama
    untuk dianalisis sebagai insight bisnis retail dalam format Markdown.
    """
    total = db.query(CustomerCluster).count()
    if total == 0:
        raise HTTPException(status_code=404, detail="Belum ada data pelanggan di database.")

    pasif        = db.query(CustomerCluster).filter(CustomerCluster.cluster == 1).count()
    loyal        = db.query(CustomerCluster).filter(CustomerCluster.cluster == 2).count()
    avg_monetary  = db.query(func.avg(CustomerCluster.monetary)).scalar() or 0
    avg_recency   = db.query(func.avg(CustomerCluster.recency)).scalar() or 0
    avg_frequency = db.query(func.avg(CustomerCluster.frequency)).scalar() or 0
    max_monetary  = db.query(func.max(CustomerCluster.monetary)).scalar() or 0
    min_recency   = db.query(func.min(CustomerCluster.recency)).scalar() or 0

    pct_pasif = round(pasif / total * 100, 1)
    pct_loyal = round(loyal / total * 100, 1)

    context = f"""## Data Agregasi Platform NexaBI

**Ringkasan Pelanggan:**
- Total Pelanggan: {total:,}
- Pelanggan Pasif (Cluster 1): {pasif:,} ({pct_pasif}%)
- Pelanggan Loyal (Cluster 2): {loyal:,} ({pct_loyal}%)

**Metrik RFM Rata-rata:**
- Recency (hari sejak transaksi terakhir): {round(avg_recency, 1)} hari
- Frequency (jumlah transaksi): {round(avg_frequency, 1)} transaksi
- Monetary (nilai transaksi): Rp {round(avg_monetary, 0):,.0f}

**Metrik Tambahan:**
- Nilai transaksi tertinggi: Rp {round(max_monetary, 0):,.0f}
- Recency terpendek (pelanggan paling aktif): {min_recency} hari
"""

    prompt = f"{SYSTEM_INSTRUCTION}\n\n{context}\n\nBerikan analisis singkat (maks 150 kata) dan 3 rekomendasi strategis:"
    insight = call_ollama(prompt, max_tokens=MAX_TOKENS_INSIGHT)
    return {"insight": insight}


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 2: POST /api/analytics/chat
# ─────────────────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat_with_ai(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Menerima pertanyaan dari user dan mengembalikan jawaban interaktif
    dari Ollama yang sudah dibekali konteks profil platform NexaBI.
    """
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Pesan tidak boleh kosong.")

    total        = db.query(CustomerCluster).count()
    pasif        = db.query(CustomerCluster).filter(CustomerCluster.cluster == 1).count()
    loyal        = db.query(CustomerCluster).filter(CustomerCluster.cluster == 2).count()
    avg_monetary  = db.query(func.avg(CustomerCluster.monetary)).scalar() or 0

    store_profile = f"""Profil Platform (NexaBI Dashboard):
- Platform: Next-Generation Business Intelligence Platform untuk Customer Analytics dan Product Recommendation pada Retail
- Total Pelanggan Terdata: {total:,}
- Pelanggan Loyal: {loyal:,} | Pelanggan Pasif: {pasif:,}
- Rata-rata Nilai Transaksi: Rp {round(avg_monetary, 0):,.0f}
- Metode Segmentasi: K-Means berbasis RFM (Recency, Frequency, Monetary)
- Pengguna: Administrator yang login sebagai "{current_user.username}"
"""

    prompt = f"""{SYSTEM_INSTRUCTION}

Konteks Platform:
{store_profile}

Pertanyaan: {req.message}

Jawab singkat maksimal 100 kata, ramah, dan langsung ke solusi."""

    reply = call_ollama(prompt, max_tokens=MAX_TOKENS_CHAT)
    return {"reply": reply}
