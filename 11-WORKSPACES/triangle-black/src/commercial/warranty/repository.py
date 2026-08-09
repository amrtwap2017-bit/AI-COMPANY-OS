"""warranty/repository.py — Sprint-081"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import uuid
from datetime import datetime

def get_all(db, hotel_id, status=None, limit=50):
    where = "WHERE hotel_id = :hotel_id"
    params = {"hotel_id": hotel_id, "limit": limit}
    if status:
        where += " AND status = :status"
        params["status"] = status
    rows = db.execute(text(f"SELECT * FROM asset_warranties {where} ORDER BY created_at DESC LIMIT :limit"), params).fetchall()
    return [dict(r._mapping) for r in rows]

def get_by_id(db, warranty_id, hotel_id):
    row = db.execute(text("SELECT * FROM asset_warranties WHERE id = :id AND hotel_id = :hotel_id"), {"id": warranty_id, "hotel_id": hotel_id}).fetchone()
    return dict(row._mapping) if row else None

def create(db, data, hotel_id):
    wid = str(uuid.uuid4())
    now = datetime.utcnow()
    params = {**data, "id": wid, "hotel_id": hotel_id, "created_at": now, "updated_at": now}
    cols = ", ".join(params.keys())
    vals = ", ".join(f":{k}" for k in params.keys())
    db.execute(text(f"INSERT INTO asset_warranties ({cols}) VALUES ({vals})"), params)
    db.commit()
    return get_by_id(db, wid, hotel_id)
