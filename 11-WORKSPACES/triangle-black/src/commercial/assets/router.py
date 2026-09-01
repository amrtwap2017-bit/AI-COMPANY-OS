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
from datetime import datetime as _dt
from src.core.audit import audit_create, audit_update

router = APIRouter(prefix="/assets", tags=["assets"])

def row_to_dict(row):
    if hasattr(row, "_mapping"): return dict(row._mapping)
    if hasattr(row, "__dict__"):
        d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
        for k,v in d.items():
            if hasattr(v, "isoformat"): d[k] = v.isoformat()
        return d
    return {}

@router.get("/", dependencies=[Depends(get_current_user)], summary="List assets")
def list_assets(
    hotel_id: str = Depends(get_hotel_id),
    category: Optional[str] = None,
    status:   Optional[str] = None,
    skip:     int = 0,
    limit:    int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    # Sprint-198: Cache-aside for assets list (TTL=300s, assets change rarely)
    try:
        from src.core.cache import cache_get, cache_set, make_cache_key
        _hid = hotel_id or "tb-default-hotel-000000000001"
        _ck = make_cache_key("assets", _hid,
            category=category, status=status, skip=skip, limit=limit)
        cached = cache_get(_ck)
        if cached is not None:
            return cached
    except Exception:
        _ck = None

    q = "SELECT * FROM assets WHERE 1=1"
    params: dict = {}
    # hotel_id always from JWT (Sprint-252)
    q += " AND hotel_id = :hotel_id"
    params["hotel_id"] = hotel_id
    if category: q += " AND category = :category"; params["category"] = category
    if status:   q += " AND status = :status";     params["status"]   = status
    q += " ORDER BY name ASC LIMIT :limit OFFSET :skip"
    params["limit"] = limit; params["skip"] = skip
    rows = db.execute(text(q), params).fetchall()
    result = [row_to_dict(r) for r in rows]

    try:
        if _ck:
            from src.core.cache import cache_set
            cache_set(_ck, result, ttl=300)
    except Exception:
        pass

    return result


@router.get("/tree", summary="Asset hierarchy tree")
def asset_tree(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    q = "SELECT * FROM assets WHERE 1=1"
    params: dict = {}
    # hotel_id always from JWT (Sprint-252)
    q += " AND hotel_id = :hotel_id"
    params["hotel_id"] = hotel_id
    q += " ORDER BY category, name"
    rows = db.execute(text(q), params).fetchall()
    assets = [row_to_dict(r) for r in rows]
    tree: dict = {}
    for a in assets:
        cat = a.get("category","uncategorized")
        tree.setdefault(cat, []).append(a)
    return [{"category": cat, "count": len(items), "assets": items} for cat, items in tree.items()]

@router.get("/{asset_id}", summary="Get asset")
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM assets WHERE id = :id"), {"id": asset_id}).fetchone()
    if not row: raise HTTPException(404, "Asset not found")
    return row_to_dict(row)

@router.post("/", status_code=201, summary="Create asset")
def create_asset(data: dict, db: Session = Depends(get_db)):
    asset_id = str(uuid.uuid4())
    now      = _dt.utcnow()
    db.execute(text(
        "INSERT INTO assets (id, hotel_id, site_id, category, name, manufacturer, model,"
        " serial_number, location_description, service_frequency, criticality, status,"
        " notes, created_at, updated_at)"
        " VALUES (:id, :hotel_id, :site_id, :category, :name, :manufacturer, :model,"
        " :serial_number, :location_description, :service_frequency, :criticality, :status,"
        " :notes, :created_at, :updated_at)"
    ), {
        "id":                   asset_id,
        "hotel_id":             data.get("hotel_id", "tb-default-hotel-000000000001"),
        "site_id":              data.get("site_id", "tb-default-hotel-000000000001"),
        "category":             data.get("category", "mechanical"),
        "name":                 data.get("name", "New Asset"),
        "manufacturer":         data.get("manufacturer"),
        "model":                data.get("model"),
        "serial_number":        data.get("serial_number"),
        "location_description": data.get("location_description"),
        "service_frequency":    data.get("service_frequency", "monthly"),
        "criticality":          data.get("criticality", "medium"),
        "status":               data.get("status", "operational"),
        "notes":                data.get("notes"),
        "created_at":           now,
        "updated_at":           now,
    })
    db.commit()
    try:
        audit_create(db, "asset", asset_id,
                     hotel_id=data.get("hotel_id"),
                     metadata={"name": data.get("name"), "category": data.get("category"), "criticality": data.get("criticality")})
    except Exception:
        pass
    return get_asset(asset_id, db)

@router.patch("/{asset_id}", summary="Update asset")
def update_asset(asset_id: str, data: dict, db: Session = Depends(get_db)):
    allowed = {"name","category","manufacturer","model","serial_number","location_description","service_frequency","criticality","status","notes"}
    updates = {k:v for k,v in data.items() if k in allowed and v is not None}
    if not updates: raise HTTPException(400, "No valid fields")
    updates["updated_at"] = _dt.utcnow()
    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["id"] = asset_id
    db.execute(text(f"UPDATE assets SET {set_clause} WHERE id = :id"), updates)
    db.commit()
    try:
        audit_update(db, "asset", asset_id,
                     new_value={k: v for k, v in data.items() if k in allowed and v is not None})
    except Exception:
        pass
    return get_asset(asset_id, db)

@router.get("/{asset_id}/work-orders", summary="Asset work orders")
def asset_work_orders(asset_id: str, db: Session = Depends(get_db)):
    rows = db.execute(text(
        "SELECT * FROM work_orders WHERE asset_id = :id ORDER BY created_at DESC LIMIT 20"
    ), {"id": asset_id}).fetchall()
    return [row_to_dict(r) for r in rows]