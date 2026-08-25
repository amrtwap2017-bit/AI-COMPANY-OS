"""Financial API Router — extracted from main.py A-007 batch 4"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/financial-v2", tags=["finance"])

@router.get("/spend-summary")
def get_spend_summary(hotel_id: str = Depends(get_hotel_id),
                      db: Session = Depends(get_db)):
    try:
        row = db.execute(text("""
            SELECT
                COUNT(*) AS total_invoices,
                COALESCE(SUM(amount), 0) AS total_spend,
                COALESCE(SUM(amount) FILTER (WHERE LOWER(status)='paid'), 0) AS paid,
                COALESCE(SUM(amount) FILTER (WHERE LOWER(status)='pending'), 0) AS pending,
                COALESCE(SUM(amount) FILTER (WHERE LOWER(status)='overdue'), 0) AS overdue
            FROM invoices WHERE hotel_id = :hid AND deleted_at IS NULL
        """), {"hid": hotel_id}).fetchone()
        result = dict(row._mapping) if row else {}
        result["hotel_id"] = hotel_id
        result["collection_rate_pct"] = round(
            float(result.get("paid", 0)) / max(float(result.get("total_spend", 1)), 1) * 100, 1
        )
        return result
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)[:100]}

@router.get("/cost-by-category")
def get_cost_by_category(hotel_id: str = Depends(get_hotel_id),
                          db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT
                COALESCE(a.category, 'Uncategorized') AS category,
                COUNT(DISTINCT wo.id) AS work_order_count,
                COALESCE(SUM(inv.amount), 0) AS total_cost,
                ROUND(AVG(inv.amount)::numeric, 2) AS avg_cost_per_wo
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id AND wo.hotel_id = :hid
            LEFT JOIN invoices inv ON inv.work_order_id = wo.id
                AND inv.hotel_id = :hid AND inv.deleted_at IS NULL
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.category
            ORDER BY total_cost DESC
        """), {"hid": hotel_id}).fetchall()
        return {"hotel_id": hotel_id, "categories": [dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"hotel_id": hotel_id, "categories": [], "error": str(e)[:100]}
