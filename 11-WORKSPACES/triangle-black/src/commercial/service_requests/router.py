from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional
import uuid, datetime

router = APIRouter(prefix="/service-requests", tags=["service-requests"])

def row_to_dict(row):
    if hasattr(row, "_mapping"): return dict(row._mapping)
    if hasattr(row, "__dict__"):
        d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
        for k,v in d.items():
            if hasattr(v, "isoformat"): d[k] = v.isoformat()
        return d
    return {}

@router.get("/", summary="List service requests")
def list_service_requests(
    hotel_id: Optional[str] = None,
    status:   Optional[str] = None,
    skip:     int = 0,
    limit:    int = Query(default=50, le=200),
    db: Session = Depends(get_db),
):
    q = "SELECT * FROM service_requests WHERE 1=1"
    params: dict = {}
    if hotel_id: q += " AND hotel_id = :hotel_id"; params["hotel_id"] = hotel_id
    if status:   q += " AND status = :status";     params["status"]   = status
    q += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    params["limit"] = limit; params["skip"] = skip
    rows = db.execute(text(q), params).fetchall()
    return [row_to_dict(r) for r in rows]

@router.get("/{sr_id}", summary="Get service request")
def get_service_request(sr_id: str, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM service_requests WHERE id = :id"), {"id": sr_id}).fetchone()
    if not row: raise HTTPException(404, "Service request not found")
    return row_to_dict(row)

@router.post("/", status_code=201, summary="Create service request")
def create_service_request(data: dict, db: Session = Depends(get_db)):
    sr_id = str(uuid.uuid4())
    now   = datetime.datetime.utcnow()
    db.execute(text(
        "INSERT INTO service_requests (id, hotel_id, title, description, priority, status, created_at, updated_at)"
        " VALUES (:id, :hotel_id, :title, :description, :priority, :status, :created_at, :updated_at)"
    ), {
        "id":          sr_id,
        "hotel_id":    data.get("hotel_id", "tb-default-hotel-000000000001"),
        "title":       data.get("title", "New Service Request"),
        "description": data.get("description", ""),
        "priority":    data.get("priority", "medium"),
        "status":      data.get("status", "open"),
        "created_at":  now,
        "updated_at":  now,
    })
    db.commit()
    return get_service_request(sr_id, db)

@router.post("/{sr_id}/convert-to-wo", summary="Convert to work order")
def convert_to_work_order(sr_id: str, db: Session = Depends(get_db)):
    sr = get_service_request(sr_id, db)
    wo_id = str(uuid.uuid4())
    now   = datetime.datetime.utcnow()
    db.execute(text(
        "INSERT INTO work_orders (id, hotel_id, title, description, priority, status, type, created_at, updated_at)"
        " VALUES (:id, :hotel_id, :title, :description, :priority, :status, :type, :created_at, :updated_at)"
    ), {
        "id":          wo_id,
        "hotel_id":    sr.get("hotel_id"),
        "title":       sr.get("title"),
        "description": sr.get("description",""),
        "priority":    sr.get("priority","medium"),
        "status":      "open",
        "type":        "service_request",
        "created_at":  now,
        "updated_at":  now,
    })
    db.execute(text("UPDATE service_requests SET status='converted', updated_at=:now WHERE id=:id"), {"now":now,"id":sr_id})
    db.commit()
    return {"work_order_id": wo_id, "service_request_id": sr_id, "status": "converted"}
