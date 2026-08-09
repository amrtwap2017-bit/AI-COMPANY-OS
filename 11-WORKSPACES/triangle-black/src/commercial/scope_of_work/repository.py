"""scope_of_work/repository.py — Sprint-082"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import uuid
from datetime import datetime

def get_all(db: Session, hotel_id: Optional[str] = None,
            status: Optional[str] = None, limit: int = 50) -> List[dict]:
    where_parts = []
    params = {"limit": limit}
    if hotel_id:
        where_parts.append("hotel_id = :hotel_id")
        params["hotel_id"] = hotel_id
    if status:
        where_parts.append("status = :status")
        params["status"] = status
    where = "WHERE " + " AND ".join(where_parts) if where_parts else ""
    rows = db.execute(text(f"""
        SELECT * FROM scope_of_work {where}
        ORDER BY created_at DESC LIMIT :limit
    """), params).fetchall()
    return [dict(r._mapping) for r in rows]

def get_by_id(db: Session, sow_id: str) -> Optional[dict]:
    row = db.execute(text(
        "SELECT * FROM scope_of_work WHERE id = :id"
    ), {"id": sow_id}).fetchone()
    return dict(row._mapping) if row else None

def create(db: Session, data: dict, hotel_id: Optional[str] = None) -> dict:
    sid = str(uuid.uuid4())
    now = datetime.utcnow()
    params = {**data, "id": sid, "created_at": now, "updated_at": now}
    if hotel_id:
        params["hotel_id"] = hotel_id
    cols = ", ".join(params.keys())
    vals = ", ".join(f":{k}" for k in params.keys())
    db.execute(text(f"INSERT INTO scope_of_work ({cols}) VALUES ({vals})"), params)
    db.commit()
    return get_by_id(db, sid)
