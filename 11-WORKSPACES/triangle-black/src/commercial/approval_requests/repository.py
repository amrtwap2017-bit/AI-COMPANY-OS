"""approval_requests/repository.py — Sprint-083"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import uuid
from datetime import datetime

def get_all(db: Session, hotel_id: Optional[str] = None,
            status: Optional[str] = None, limit: int = 50) -> List[dict]:
    where_parts = ["1=1"]
    params = {"limit": limit}
    if hotel_id:
        where_parts.append("hotel_id = :hotel_id")
        params["hotel_id"] = hotel_id
    if status:
        where_parts.append("status = :status")
        params["status"] = status
    where = " AND ".join(where_parts)
    rows = db.execute(text(f"""
        SELECT * FROM approval_requests WHERE {where}
        ORDER BY requested_at ASC LIMIT :limit
    """), params).fetchall()
    return [dict(r._mapping) for r in rows]

def get_by_id(db: Session, req_id: str) -> Optional[dict]:
    row = db.execute(text(
        "SELECT * FROM approval_requests WHERE id = :id"
    ), {"id": req_id}).fetchone()
    return dict(row._mapping) if row else None

def get_pending(db: Session, hotel_id: Optional[str] = None) -> List[dict]:
    return get_all(db, hotel_id=hotel_id, status="pending")

def approve(db: Session, req_id: str, notes: Optional[str] = None) -> bool:
    result = db.execute(text("""
        UPDATE approval_requests SET status = "approved",
        resolved_at = :now, notes = :notes WHERE id = :id
    """), {"now": datetime.utcnow(), "notes": notes, "id": req_id})
    db.commit()
    return result.rowcount > 0

def reject(db: Session, req_id: str, notes: Optional[str] = None) -> bool:
    result = db.execute(text("""
        UPDATE approval_requests SET status = "rejected",
        resolved_at = :now, notes = :notes WHERE id = :id
    """), {"now": datetime.utcnow(), "notes": notes, "id": req_id})
    db.commit()
    return result.rowcount > 0
