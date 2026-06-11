from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import CustomerCluster, User, AssociationRule
from app.auth import get_current_user
from app.ai_helper import call_ai

router = APIRouter(prefix="/api/analytics", tags=["Analytics Extended"])


# ─── SALES PERFORMANCE ────────────────────────────────────────────────────────
@router.get("/sales-performance")
def get_sales_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Menghitung agregasi performa penjualan dari data RFM per pelanggan.
    Monetary = total revenue per pelanggan (proxy sales).
    """
    # ── Total & avg metrics ──
    total_customers = db.query(CustomerCluster).count()
    total_revenue   = db.query(func.sum(CustomerCluster.monetary)).scalar() or 0
    avg_order_value = db.query(func.avg(CustomerCluster.monetary)).scalar() or 0
    total_orders    = db.query(func.sum(CustomerCluster.frequency)).scalar() or 0
    avg_frequency   = db.query(func.avg(CustomerCluster.frequency)).scalar() or 0

    # ── Revenue per segment ──
    segments = db.query(CustomerCluster.segment).distinct().all()
    revenue_by_segment = []
    for (seg,) in segments:
        rev  = db.query(func.sum(CustomerCluster.monetary)).filter(CustomerCluster.segment == seg).scalar() or 0
        cnt  = db.query(CustomerCluster).filter(CustomerCluster.segment == seg).count()
        freq = db.query(func.sum(CustomerCluster.frequency)).filter(CustomerCluster.segment == seg).scalar() or 0
        revenue_by_segment.append({
            "segment": seg,
            "total_revenue": round(rev, 2),
            "customer_count": cnt,
            "total_orders": int(freq),
            "avg_order_value": round(rev / cnt, 2) if cnt else 0,
            "revenue_pct": round(rev / total_revenue * 100, 1) if total_revenue else 0,
        })
    revenue_by_segment.sort(key=lambda x: x["total_revenue"], reverse=True)

    # ── Revenue distribution buckets (histogram proxy) ──
    buckets = [
        (0,     2000,   "< 2K"),
        (2000,  5000,   "2K–5K"),
        (5000,  10000,  "5K–10K"),
        (10000, 20000,  "10K–20K"),
        (20000, 99999,  "> 20K"),
    ]
    distribution = []
    for lo, hi, label in buckets:
        count = db.query(CustomerCluster).filter(
            CustomerCluster.monetary >= lo,
            CustomerCluster.monetary < hi
        ).count()
        distribution.append({"range": label, "count": count})

    # ── Top segments by loyalty (loyal = cluster 2) ──
    loyal_by_seg = []
    for (seg,) in segments:
        total_seg = db.query(CustomerCluster).filter(CustomerCluster.segment == seg).count()
        loyal_seg = db.query(CustomerCluster).filter(
            CustomerCluster.segment == seg,
            CustomerCluster.cluster == 2
        ).count()
        avg_m = db.query(func.avg(CustomerCluster.monetary)).filter(CustomerCluster.segment == seg).scalar() or 0
        avg_f = db.query(func.avg(CustomerCluster.frequency)).filter(CustomerCluster.segment == seg).scalar() or 0
        loyal_by_seg.append({
            "segment": seg,
            "loyal_count": loyal_seg,
            "total": total_seg,
            "pct_loyal": round(loyal_seg / total_seg * 100, 1) if total_seg else 0,
            "avg_monetary": round(avg_m, 2),
            "avg_frequency": round(avg_f, 1),
        })
    loyal_by_seg.sort(key=lambda x: x["avg_monetary"], reverse=True)

    # ── Recency buckets (customer activity) ──
    recency_buckets = [
        (0,   30,  "0–30 hari"),
        (30,  90,  "31–90 hari"),
        (90,  180, "91–180 hari"),
        (180, 365, "181–365 hari"),
        (365, 9999,"365+ hari"),
    ]
    recency_dist = []
    for lo, hi, label in recency_buckets:
        count = db.query(CustomerCluster).filter(
            CustomerCluster.recency >= lo,
            CustomerCluster.recency < hi
        ).count()
        recency_dist.append({"range": label, "count": count})

    return {
        "summary": {
            "total_revenue": round(total_revenue, 2),
            "total_customers": total_customers,
            "total_orders": int(total_orders),
            "avg_order_value": round(avg_order_value, 2),
            "avg_frequency": round(avg_frequency, 1),
        },
        "revenue_by_segment": revenue_by_segment,
        "monetary_distribution": distribution,
        "recency_distribution": recency_dist,
        "segment_loyalty": loyal_by_seg,
    }


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
MAX_TOKENS_CHURN   = 250


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

    analysis = call_ai(prompt, max_tokens=MAX_TOKENS_CHURN)
    return {"analysis": analysis, "total_at_risk": at_risk_cnt, "avg_recency": round(avg_recency, 1)}


# ─── SALES FORECAST AI ────────────────────────────────────────────────────────
@router.get("/sales-forecast")
def get_sales_forecast(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mengambil agregasi data RFM dan mengirimkannya ke AI untuk
    menghasilkan proyeksi penjualan bulan depan secara naratif.
    """
    total          = db.query(CustomerCluster).count()
    total_revenue  = db.query(func.sum(CustomerCluster.monetary)).scalar() or 0
    avg_monetary   = db.query(func.avg(CustomerCluster.monetary)).scalar() or 0
    avg_recency    = db.query(func.avg(CustomerCluster.recency)).scalar() or 0
    avg_frequency  = db.query(func.avg(CustomerCluster.frequency)).scalar() or 0
    total_orders   = db.query(func.sum(CustomerCluster.frequency)).scalar() or 0
    loyal_count    = db.query(CustomerCluster).filter(CustomerCluster.cluster == 2).count()
    pasif_count    = db.query(CustomerCluster).filter(CustomerCluster.cluster == 1).count()

    # Churn risk count (pasif + recency > avg)
    at_risk = db.query(CustomerCluster).filter(
        CustomerCluster.cluster == 1,
        CustomerCluster.recency > avg_recency
    ).count()

    # Revenue per segment
    segments = db.query(CustomerCluster.segment).distinct().all()
    seg_data = []
    for (seg,) in segments:
        rev  = db.query(func.sum(CustomerCluster.monetary)).filter(CustomerCluster.segment == seg).scalar() or 0
        cnt  = db.query(CustomerCluster).filter(CustomerCluster.segment == seg).count()
        freq = db.query(func.sum(CustomerCluster.frequency)).filter(CustomerCluster.segment == seg).scalar() or 0
        seg_data.append(f"- {seg}: revenue ${rev:,.0f}, {cnt} pelanggan, {int(freq)} orders")

    seg_summary = "\n".join(seg_data)
    pct_loyal = round(loyal_count / total * 100, 1) if total else 0
    pct_churn = round(at_risk / total * 100, 1) if total else 0

    prompt = f"""Kamu adalah NexaBI Sales Forecaster, analis bisnis retail berpengalaman.

ATURAN WAJIB:
- Bahasa Indonesia, profesional
- Format Markdown: gunakan ## heading, bullet - , dan **bold**
- MAKSIMAL 200 kata total
- Berikan 1 proyeksi angka estimasi revenue bulan depan (range, bukan angka pasti)
- Berikan 3 faktor pendorong/penghambat yang spesifik
- Berikan 2 rekomendasi aksi konkret untuk meningkatkan penjualan bulan depan
- Cantumkan tingkat kepercayaan forecast (Rendah/Sedang/Tinggi) beserta alasannya

DATA HISTORIS PLATFORM NexaBI (Global Superstore):
- Total pelanggan terdata: {total:,}
- Pelanggan loyal (aktif): {loyal_count:,} ({pct_loyal}%)
- Pelanggan pasif: {pasif_count:,}
- Pelanggan berisiko churn: {at_risk:,} ({pct_churn}% dari total)
- Total revenue historis: ${total_revenue:,.0f}
- Rata-rata revenue per pelanggan: ${avg_monetary:,.0f}
- Rata-rata frekuensi order: {avg_frequency:.1f}x
- Total order historis: {int(total_orders):,}
- Rata-rata recency (hari sejak transaksi terakhir): {avg_recency:.0f} hari

Revenue per segmen:
{seg_summary}

Berikan proyeksi penjualan bulan depan berdasarkan data di atas:"""

    forecast = call_ai(prompt, max_tokens=400)
    return {
        "forecast": forecast,
        "context": {
            "total_customers": total,
            "loyal_count": loyal_count,
            "at_risk_count": at_risk,
            "total_revenue": round(total_revenue, 2),
            "avg_monetary": round(avg_monetary, 2),
        }
    }


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

