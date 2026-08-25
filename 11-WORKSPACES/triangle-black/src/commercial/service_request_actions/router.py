"""Service Request Actions Router — extracted from main.py A-007 batch 3"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
import uuid, datetime

router = APIRouter(prefix="/service-requests-v2", tags=["service-requests"])

@router.get("/{sr_id}/work-order")
def get_sr_work_order(sr_id: str, hotel_id: str = Depends(get_hotel_id),
                      db: Session = Depends(get_db)):
    """Get the work order linked to a service request."""
    try:
        wo = db.execute(text("""
            SELECT wo.* FROM work_orders wo
            JOIN service_requests sr ON sr.id = :sr_id
            WHERE wo.hotel_id = :hid AND wo.deleted_at IS NULL
              AND (wo.id = sr.work_order_id OR wo.description LIKE :pattern)
            LIMIT 1
        """), {"sr_id": sr_id, "hid": hotel_id,
               "pattern": f"%{sr_id}%"}).fetchone()
        if not wo:
            return {"service_request_id": sr_id, "work_order": None,
                    "message": "No work order linked yet"}
        return {"service_request_id": sr_id, "work_order": dict(wo._mapping)}
    except Exception as e:
        return {"service_request_id": sr_id, "work_order": None,
                "error": str(e)[:100]}

@router.post("/{sr_id}/generate-work-order")
def generate_work_order_from_sr(sr_id: str, data: dict = None,
                                hotel_id: str = Depends(get_hotel_id),
                                db: Session = Depends(get_db)):
    """Generate a work order from a service request."""
    data = data or {}
    try:
        sr = db.execute(text(
            "SELECT * FROM service_requests WHERE id=:id AND hotel_id=:hid"
        ), {"id": sr_id, "hid": hotel_id}).fetchone()
        if not sr:
            raise HTTPException(404, "Service request not found")

        now = datetime.datetime.utcnow()
        wo_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO work_orders (id, hotel_id, title, type, priority, status,
                description, created_at, updated_at)
            VALUES (:id, :hid, :title, 'corrective', :priority, 'open',
                :desc, :now, :now)
            ON CONFLICT DO NOTHING
        """), {
            "id": wo_id, "hid": hotel_id,
            "title": f"WO for SR: {getattr(sr, 'title', sr_id)}",
            "priority": data.get("priority", "medium"),
            "desc": f"Generated from service request {sr_id}",
            "now": now
        })
        db.commit()
        return {"success": True, "service_request_id": sr_id,
                "work_order_id": wo_id, "created_at": now.isoformat()}
    except HTTPException: raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e)[:200])
