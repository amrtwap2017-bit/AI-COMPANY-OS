"""Work Order Actions Router — extracted from main.py A-007 batch 2"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
import uuid, datetime
from datetime import datetime as _dt

router = APIRouter(prefix="/work-orders-v2", tags=["work-orders"])

@router.post("/{wo_id}/complete")
def complete_work_order(wo_id: str,
                        data: dict = None,
                        hotel_id: str = Depends(get_hotel_id),
                        db: Session = Depends(get_db),
                        current_user=Depends(get_current_user)):
    """Mark work order as completed and auto-create invoice."""
    data = data or {}
    try:
        wo = db.execute(text(
            "SELECT * FROM work_orders WHERE id=:id AND hotel_id=:hid AND deleted_at IS NULL"
        ), {"id": wo_id, "hid": hotel_id}).fetchone()

        if not wo:
            raise HTTPException(404, "Work order not found")

        now = _dt.utcnow()
        db.execute(text(
            "UPDATE work_orders SET status='completed', completed_at=:now, updated_at=:now "
            "WHERE id=:id AND hotel_id=:hid"
        ), {"now": now, "id": wo_id, "hid": hotel_id})

        inv_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO invoices (id, hotel_id, invoice_number, work_order_id,
                amount, status, description, created_at, updated_at)
            VALUES (:id, :hid, :num, :wo_id, :amount, 'pending',
                :desc, :now, :now)
            ON CONFLICT DO NOTHING
        """), {
            "id": inv_id, "hid": hotel_id,
            "num": f"INV-WO-{wo_id[:8].upper()}",
            "wo_id": wo_id,
            "amount": data.get("cost", 0),
            "desc": f"Auto-invoice for WO: {getattr(wo, 'title', wo_id)}",
            "now": now
        })
        db.commit()

        return {
            "success": True,
            "work_order_id": wo_id,
            "status": "completed",
            "invoice_id": inv_id,
            "completed_at": now.isoformat()
        }
    except HTTPException: raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e)[:200])

@router.get("/assets-sync")
def get_wo_assets_sync(hotel_id: str = Depends(get_hotel_id),
                       db: Session = Depends(get_db)):
    """Assets with their work order count for sync."""
    try:
        rows = db.execute(text("""
            SELECT a.id, a.name, a.category, a.criticality, a.status,
                   COUNT(wo.id) AS open_wo_count
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :hid AND wo.status = 'open' AND wo.deleted_at IS NULL
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.id, a.name, a.category, a.criticality, a.status
            ORDER BY open_wo_count DESC, a.name
            LIMIT 100
        """), {"hid": hotel_id}).fetchall()
        return {"count": len(rows), "assets": [dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"count": 0, "assets": [], "error": str(e)[:100]}
