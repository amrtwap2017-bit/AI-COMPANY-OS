"""Supplier API Router — extracted from main.py A-007 batch 5"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/suppliers-v2", tags=["suppliers"])

@router.get("/performance")
def get_supplier_performance(hotel_id: str = Depends(get_hotel_id),
                              db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT s.id, s.company_name AS name, s.category,
                   s.rating, s.status,
                   COUNT(po.id) AS total_orders,
                   COALESCE(SUM(po.total_amount), 0) AS total_spend
            FROM suppliers s
            LEFT JOIN purchase_orders po ON po.supplier_id = s.id AND po.hotel_id = :hid
            WHERE s.hotel_id = :hid
            GROUP BY s.id, s.company_name, s.category, s.rating, s.status
            ORDER BY total_spend DESC, s.rating DESC
        """), {"hid": hotel_id}).fetchall()
        return {"hotel_id": hotel_id, "count": len(rows),
                "suppliers": [dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"hotel_id": hotel_id, "count": 0, "suppliers": [], "error": str(e)[:100]}

@router.get("/top-spend")
def get_top_spend_suppliers(hotel_id: str = Depends(get_hotel_id),
                             db: Session = Depends(get_db),
                             limit: int = Query(10, le=50)):
    try:
        rows = db.execute(text("""
            SELECT s.company_name, s.category, s.rating,
                   COALESCE(SUM(inv.amount), 0) AS total_invoiced,
                   COUNT(DISTINCT inv.id) AS invoice_count
            FROM suppliers s
            LEFT JOIN invoices inv ON inv.hotel_id = :hid
                AND inv.deleted_at IS NULL
                AND inv.description ILIKE CONCAT('%', s.company_name, '%')
            WHERE s.hotel_id = :hid
            GROUP BY s.company_name, s.category, s.rating
            ORDER BY total_invoiced DESC
            LIMIT :limit
        """), {"hid": hotel_id, "limit": limit}).fetchall()
        return {"hotel_id": hotel_id, "suppliers": [dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"hotel_id": hotel_id, "suppliers": [], "error": str(e)[:100]}
