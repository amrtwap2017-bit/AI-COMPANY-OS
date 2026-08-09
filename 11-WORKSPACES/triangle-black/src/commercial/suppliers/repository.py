"""suppliers/repository.py — Sprint-081"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
import uuid
from datetime import datetime

def get_all(db, hotel_id, status=None, limit=100, offset=0):
    where = "WHERE hotel_id = :hotel_id"
    params = {"hotel_id": hotel_id, "limit": limit, "offset": offset}
    if status:
        where += " AND status = :status"
        params["status"] = status
    rows = db.execute(text(f"SELECT * FROM suppliers {where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset"), params).fetchall()
    count = db.execute(text(f"SELECT COUNT(*) FROM suppliers {where}"), {k:v for k,v in params.items() if k not in ("limit","offset")}).scalar()
    return {"count": count, "results": [dict(r._mapping) for r in rows]}

def get_by_id(db, supplier_id, hotel_id):
    row = db.execute(text("SELECT * FROM suppliers WHERE id = :id AND hotel_id = :hotel_id"), {"id": supplier_id, "hotel_id": hotel_id}).fetchone()
    return dict(row._mapping) if row else None

def create(db, data, hotel_id):
    sid = str(uuid.uuid4())
    now = datetime.utcnow()
    d = {**data, "id": sid, "hotel_id": hotel_id, "created_at": now, "updated_at": now}
    if not d.get("supplier_code"):
        d["supplier_code"] = f"SUP-{sid[:6].upper()}"
    cols = ", ".join(d.keys())
    vals = ", ".join(f":{k}" for k in d.keys())
    db.execute(text(f"INSERT INTO suppliers ({cols}) VALUES ({vals})"), d)
    db.commit()
    return get_by_id(db, sid, hotel_id)

def update(db, supplier_id, hotel_id, data):
    allowed = ["company_name","arabic_name","status","supplier_type","payment_terms",
               "lead_time_days","risk_level","notes","city","country","phone",
               "email","category","contact_person","credit_limit","rating"]
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        return get_by_id(db, supplier_id, hotel_id)
    updates["updated_at"] = datetime.utcnow()
    updates["id"] = supplier_id
    updates["hotel_id"] = hotel_id
    set_clause = ", ".join(f"{k} = :{k}" for k in updates if k not in ("id","hotel_id"))
    db.execute(text(f"UPDATE suppliers SET {set_clause} WHERE id = :id AND hotel_id = :hotel_id"), updates)
    db.commit()
    return get_by_id(db, supplier_id, hotel_id)
