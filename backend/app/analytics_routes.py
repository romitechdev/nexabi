from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import requests

from app.database import get_db
from app.models import CustomerCluster, User, AssociationRule
from app.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics Extended"])


# ─── TOP 10 CUSTOMERS ────────────────────────────────────────────────────────
@router.get("/top-customers")
def get_top_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customers = (
        db.query(CustomerCluster)
        .order_by(CustomerCluster.monetary.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "customer_id": c.customer_id,
            "customer_name": c.customer_name,
            "segment": c.segment,
            "recency": c.recency,
            "frequency": c.frequency,
            "monetary": round(c.monetary, 2),
            "cluster": c.cluster,
            "cluster_name": "Loyal" if c.cluster == 2 else "Pasif",
        }
        for c in customers
    ]


# ─── CHURN RISK CUSTOMERS ─────────────────────────────────────────────────────
@router.get("/churn-risk")
def get_churn_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    avg_recency = db.query(func.avg(CustomerCluster.recency)).scalar() or 0

    # Pelanggan berisiko: cluster pasif DAN recency > rata-rata (lama tidak belanja)
    at_risk = (
        db.query(CustomerCluster)
        .filter(
            CustomerCluster.cluster == 1,
            CustomerCluster.recency > avg_recency
        )
        .order_by(CustomerCluster.recency.desc())
        .limit(50)
        .all()
    )

    return {
        "avg_recency": round(avg_recency, 1),
        "total_at_risk": len(at_risk),
        "customers": [
            {
                "customer_id": c.customer_id,
                "customer_name": c.customer_name,
                "segment": c.segment,
                "recency": c.recency,
                "frequency": c.frequency,
                "monetary": round(c.monetary, 2),
            }
            for c in at_risk
        ]
    }


# ─── SEGMENT STATS ────────────────────────────────────────────────────────────
@router.get("/segment-stats")
def get_segment_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    segments = db.query(CustomerCluster.segment).distinct().all()
    result = []

    for (seg,) in segments:
        total   = db.query(CustomerCluster).filter(CustomerCluster.segment == seg).count()
        loyal   = db.query(CustomerCluster).filter(CustomerCluster.segment == seg, CustomerCluster.cluster == 2).count()
        pasif   = db.query(CustomerCluster).filter(CustomerCluster.segment == seg, CustomerCluster.cluster == 1).count()
        avg_m   = db.query(func.avg(CustomerCluster.monetary)).filter(CustomerCluster.segment == seg).scalar() or 0
        avg_r   = db.query(func.avg(CustomerCluster.recency)).filter(CustomerCluster.segment == seg).scalar() or 0
        avg_f   = db.query(func.avg(CustomerCluster.frequency)).filter(CustomerCluster.segment == seg).scalar() or 0

        result.append({
            "segment": seg,
            "total": total,
            "loyal": loyal,
            "pasif": pasif,
            "pct_loyal": round(loyal / total * 100, 1) if total else 0,
            "avg_monetary": round(avg_m, 2),
            "avg_recency": round(avg_r, 1),
            "avg_frequency": round(avg_f, 1),
        })

    return sorted(result, key=lambda x: x["total"], reverse=True)


# ─── RFM SCATTER DATA ─────────────────────────────────────────────────────────
@router.get("/rfm-scatter")
def get_rfm_scatter(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customers = db.query(CustomerCluster).all()
    return [
        {
            "x": round(c.recency_scaled, 4),
            "y": round(c.frequency_scaled, 4),
            "z": round(c.monetary_scaled, 4),
            "cluster": c.cluster,
            "name": c.customer_name,
            "monetary": round(c.monetary, 0),
        }
        for c in customers
    ]


# ─── CHURN AI ANALYSIS ────────────────────────────────────────────────────────
OLLAMA_BASE_URL    = "http://192.168.10.16:11434"
OLLAMA_MODEL       = "llama3.1:8b"
MAX_TOKENS_CHURN   = 250

def call_ollama(prompt: str, max_tokens: int = 250) -> str:
    try:
        resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False,
                  "options": {"num_predict": max_tokens, "temperature": 0.7}},
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")


@router.get("/churn-ai")
def get_churn_ai_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    avg_recency = db.query(func.avg(CustomerCluster.recency)).scalar() or 0
    total       = db.query(CustomerCluster).count()
    at_risk_cnt = db.query(CustomerCluster).filter(
        CustomerCluster.cluster == 1,
        CustomerCluster.recency > avg_recency
    ).count()
    avg_m_atrisk = db.query(func.avg(CustomerCluster.monetary)).filter(
        CustomerCluster.cluster == 1,
        CustomerCluster.recency > avg_recency
    ).scalar() or 0

    prompt = f"""Kamu adalah NexaBI Smart Advisor, analis bisnis retail.
Aturan: Bahasa Indonesia, format Markdown, MAKSIMAL 120 kata, langsung ke poin.

Data Churn Risk:
- Total pelanggan: {total:,}
- Pelanggan berisiko churn: {at_risk_cnt:,} ({round(at_risk_cnt/total*100,1)}% dari total)
- Rata-rata hari sejak transaksi terakhir (keseluruhan): {round(avg_recency,1)} hari
- Rata-rata monetary pelanggan berisiko: Rp {round(avg_m_atrisk,0):,.0f}

Berikan analisis churn risk dan 3 strategi retensi konkret:"""

    analysis = call_ollama(prompt, max_tokens=MAX_TOKENS_CHURN)
    return {"analysis": analysis, "total_at_risk": at_risk_cnt, "avg_recency": round(avg_recency, 1)}


# ─── MARKET BASKET ANALYSIS ───────────────────────────────────────────────────
@router.get("/market-basket")
def get_market_basket(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rules = db.query(AssociationRule).order_by(AssociationRule.confidence.desc()).all()
    return [
        {
            "id": r.id,
            "antecedents": r.antecedents,
            "consequents": r.consequents,
            "support": r.support,
            "confidence": r.confidence,
            "lift": r.lift
        }
        for r in rules
    ]

