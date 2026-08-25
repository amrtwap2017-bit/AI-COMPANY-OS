"""Maintenance API Router — extracted from main.py A-007 batch 4"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/maintenance-v2", tags=["maintenance"])

@router.get("/assets-with-work-orders")
def assets_with_work_orders(hotel_id: str = Depends(get_hotel_id),
                             db: Session = Depends(get_db),
                             limit: int = Query(50, le=200)):
    try:
        rows = db.execute(text("""
            SELECT a.id, a.name, a.category, a.criticality, a.status,
                   COUNT(wo.id) FILTER (WHERE wo.status NOT IN ('completed','closed','cancelled'))
                     AS open_wo_count,
                   MAX(wo.created_at) AS last_wo_date
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id AND wo.hotel_id = :hid
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.id, a.name, a.category, a.criticality, a.status
            ORDER BY open_wo_count DESC, a.criticality, a.name
            LIMIT :limit
        """), {"hid": hotel_id, "limit": limit}).fetchall()
        return {"count": len(rows), "assets": [dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"count": 0, "assets": [], "error": str(e)[:100]}

@router.get("/overdue-pm")
def get_overdue_pm(hotel_id: str = Depends(get_hotel_id),
                   db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT p.id, p.asset_id, p.name, p.frequency, p.next_due_date,
                   a.name AS asset_name, a.criticality,
                   CURRENT_DATE - p.next_due_date::date AS days_overdue
            FROM pm_plans p
            JOIN assets a ON a.id = p.asset_id AND a.hotel_id = :hid
            WHERE p.hotel_id = :hid AND p.next_due_date < NOW()
              AND LOWER(p.status) = 'active'
            ORDER BY days_overdue DESC
            LIMIT 50
        """), {"hid": hotel_id}).fetchall()
        return {"overdue_count": len(rows),
                "plans": [dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"overdue_count": 0, "plans": [], "error": str(e)[:100]}
