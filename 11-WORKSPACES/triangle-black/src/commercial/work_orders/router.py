from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional, List
import uuid, datetime

router = APIRouter(prefix="/work-orders", tags=["work-orders"])

def row_to_dict(row):
    if hasattr(row, "_mapping"): return dict(row._mapping)
    if hasattr(row, "__dict__"):
        d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
        for k,v in d.items():
            if hasattr(v, "isoformat"): d[k] = v.isoformat()
        return d
    return {}

@router.get("/", summary="List work orders")
def list_work_orders(
    hotel_id:      Optional[str] = None,
    status:        Optional[str] = None,
    priority:      Optional[str] = None,
    technician_id: Optional[str] = None,
    skip:          int = 0,
    limit:         int = Query(default=50, le=200),
    db: Session = Depends(get_db),
):
    q = "SELECT * FROM work_orders WHERE 1=1"
    params: dict = {}
    if hotel_id:      q += " AND hotel_id = :hotel_id";           params["hotel_id"]      = hotel_id
    if status:        q += " AND status = :status";               params["status"]        = status
    if priority:      q += " AND priority = :priority";           params["priority"]      = priority
    if technician_id: q += " AND technician_id = :technician_id"; params["technician_id"] = technician_id
    q += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    params["limit"] = limit; params["skip"] = skip
    rows = db.execute(text(q), params).fetchall()
    return [row_to_dict(r) for r in rows]

@router.get("/{work_order_id}", summary="Get work order")
def get_work_order(work_order_id: str, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM work_orders WHERE id = :id"), {"id": work_order_id}).fetchone()
    if not row: raise HTTPException(404, "Work order not found")
    return row_to_dict(row)

@router.post("/", status_code=201, summary="Create work order")
def create_work_order(data: dict, db: Session = Depends(get_db)):
    wo_id = str(uuid.uuid4())
    now   = datetime.datetime.utcnow()
    db.execute(text(
        "INSERT INTO work_orders (id, hotel_id, title, description, priority, status, type,"
        " technician_id, asset_id, site_id, due_date, created_at, updated_at)"
        " VALUES (:id, :hotel_id, :title, :description, :priority, :status, :type,"
        " :technician_id, :asset_id, :site_id, :due_date, :created_at, :updated_at)"
    ), {
        "id":           wo_id,
        "hotel_id":     data.get("hotel_id", "tb-default-hotel-000000000001"),
        "title":        data.get("title", "New Work Order"),
        "description":  data.get("description", ""),
        "priority":     data.get("priority", "medium"),
        "status":       data.get("status", "open"),
        "type":         data.get("type", "corrective"),
        "technician_id":data.get("technician_id"),
        "asset_id":     data.get("asset_id"),
        "site_id":      data.get("site_id"),
        "due_date":     data.get("due_date"),
        "created_at":   now,
        "updated_at":   now,
    })
    db.commit()
    return get_work_order(wo_id, db)

@router.patch("/{work_order_id}", summary="Update work order")
def update_work_order(work_order_id: str, data: dict, db: Session = Depends(get_db)):
    allowed = {"title","description","priority","status","type","technician_id","asset_id","due_date","started_at","completed_at"}
    updates = {k:v for k,v in data.items() if k in allowed and v is not None}
    if not updates: raise HTTPException(400, "No valid fields to update")
    updates["updated_at"] = datetime.datetime.utcnow()
    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["id"] = work_order_id
    db.execute(text(f"UPDATE work_orders SET {set_clause} WHERE id = :id"), updates)
    db.commit()
    return get_work_order(work_order_id, db)

@router.delete("/{work_order_id}", status_code=204, summary="Delete work order")
def delete_work_order(work_order_id: str, db: Session = Depends(get_db)):
    db.execute(text("DELETE FROM work_orders WHERE id = :id"), {"id": work_order_id})
    db.commit()

@router.get("/{work_order_id}/history", summary="Work order history")
def work_order_history(work_order_id: str, db: Session = Depends(get_db)):
    rows = db.execute(text(
        "SELECT * FROM activities WHERE entity_id = :id ORDER BY created_at DESC LIMIT 50"
    ), {"id": work_order_id}).fetchall()
    return [row_to_dict(r) for r in rows]
