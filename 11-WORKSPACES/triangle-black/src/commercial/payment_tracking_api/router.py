"""Payment Tracking Router — extracted from main.py A-007 batch 2"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/payment-tracking-v2", tags=["finance"])

@router.get("/")
def list_payments(hotel_id: str = Depends(get_hotel_id),
                  db: Session = Depends(get_db),
                  limit: int = Query(100, le=500),
                  status: str = Query(None)):
    try:
        where = "WHERE hotel_id = :hid"
        params: dict = {"hid": hotel_id, "limit": limit}
        if status:
            where += " AND LOWER(status) = :status"
            params["status"] = status.lower()
        rows = db.execute(text(
            f"SELECT * FROM payment_records {where} ORDER BY created_at DESC LIMIT :limit"
        ), params).fetchall()
        return {"count": len(rows), "hotel_id": hotel_id,
                "results": [dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"count": 0, "results": [], "error": str(e)[:100]}

@router.get("/summary")
def payment_summary(hotel_id: str = Depends(get_hotel_id),
                    db: Session = Depends(get_db)):
    try:
        row = db.execute(text("""
            SELECT
                COUNT(*) AS total_payments,
                COALESCE(SUM(amount), 0) AS total_amount,
                COUNT(*) FILTER (WHERE LOWER(status) = 'paid') AS paid_count,
                COALESCE(SUM(amount) FILTER (WHERE LOWER(status) = 'paid'), 0) AS paid_amount,
                COUNT(*) FILTER (WHERE LOWER(status) = 'pending') AS pending_count
            FROM payment_records WHERE hotel_id = :hid
        """), {"hid": hotel_id}).fetchone()
        return dict(row._mapping) if row else {}
    except Exception as e:
        return {"error": str(e)[:100], "hotel_id": hotel_id}
