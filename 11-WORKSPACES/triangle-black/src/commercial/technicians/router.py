from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query
from src.core.auth import get_current_user
from src.commercial.auth.models import User
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from typing import Optional
import uuid, datetime

router = APIRouter(prefix="/technicians", tags=["technicians"])

def row_to_dict(row):
    if hasattr(row, "_mapping"): return dict(row._mapping)
    if hasattr(row, "__dict__"):
        d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
        for k,v in d.items():
            if hasattr(v, "isoformat"): d[k] = v.isoformat()
        return d
    return {}

@router.get("/", dependencies=[Depends(get_current_user)], summary="List technicians")
def list_technicians(
    hotel_id: str = Depends(get_hotel_id),
    is_active: Optional[bool] = None,
    skip:      int = 0,
    limit:     int = Query(default=50, le=200),
    db: Session = Depends(get_db),
):
    q = "SELECT * FROM technicians WHERE 1=1"
    params: dict = {}
    if hotel_id:             q += " AND hotel_id = :hotel_id";    params["hotel_id"]  = hotel_id
    if is_active is not None:q += " AND is_active = :is_active";  params["is_active"] = is_active
    q += " ORDER BY name ASC LIMIT :limit OFFSET :skip"
    params["limit"] = limit; params["skip"] = skip
    rows = db.execute(text(q), params).fetchall()
    return [row_to_dict(r) for r in rows]


@router.get("/{technician_id}", summary="Get technician")
def get_technician(technician_id: str, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM technicians WHERE id = :id"), {"id": technician_id}).fetchone()
    if not row: raise HTTPException(404, "Technician not found")
    return row_to_dict(row)

@router.post("/", status_code=201, summary="Create technician")
def create_technician(data: dict, db: Session = Depends(get_db)):
    tech_id = str(uuid.uuid4())
    now     = datetime.datetime.utcnow()
    import json as _json
    db.execute(text(
        "INSERT INTO technicians (id, hotel_id, name, email, phone, specializations,"
        " max_work_orders, current_work_orders, is_active, notes, created_at, updated_at)"
        " VALUES (:id, :hotel_id, :name, :email, :phone, :specializations,"
        " :max_work_orders, :current_work_orders, :is_active, :notes, :created_at, :updated_at)"
    ), {
        "id":                  tech_id,
        "hotel_id":            data.get("hotel_id", "tb-default-hotel-000000000001"),
        "name":                data.get("name", "New Technician"),
        "email":               data.get("email", "tech@triangleblack.com"),
        "phone":               data.get("phone"),
        "specializations":     _json.dumps(data.get("specializations", [])),
        "max_work_orders":     data.get("max_work_orders", 10),
        "current_work_orders": 0,
        "is_active":           data.get("is_active", True),
        "notes":               data.get("notes"),
        "created_at":          now,
        "updated_at":          now,
    })
    db.commit()
    return get_technician(tech_id, db)

@router.patch("/{technician_id}", summary="Update technician")
def update_technician(technician_id: str, data: dict, db: Session = Depends(get_db)):
    allowed = {"name","email","phone","specializations","max_work_orders","is_active","notes"}
    updates = {k:v for k,v in data.items() if k in allowed and v is not None}
    if not updates: raise HTTPException(400, "No valid fields")
    updates["updated_at"] = datetime.datetime.utcnow()
    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["id"] = technician_id
    db.execute(text(f"UPDATE technicians SET {set_clause} WHERE id = :id"), updates)
    db.commit()
    return get_technician(technician_id, db)

@router.get("/{technician_id}/work-orders", summary="Technician work orders")
def technician_work_orders(technician_id: str, db: Session = Depends(get_db)):
    rows = db.execute(text(
        "SELECT * FROM work_orders WHERE technician_id = :id ORDER BY created_at DESC LIMIT 20"
    ), {"id": technician_id}).fetchall()
    return [row_to_dict(r) for r in rows]