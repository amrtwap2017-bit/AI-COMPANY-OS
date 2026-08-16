from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional
import uuid, datetime

router = APIRouter(prefix="/assets", tags=["assets"])

def row_to_dict(row):
    if hasattr(row, "_mapping"): return dict(row._mapping)
    if hasattr(row, "__dict__"):
        d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
        for k,v in d.items():
            if hasattr(v, "isoformat"): d[k] = v.isoformat()
        return d
    return {}

@router.get("/", summary="List assets")
def list_assets(
    hotel_id: Optional[str] = None,
    category: Optional[str] = None,
    status:   Optional[str] = None,
    skip:     int = 0,
    limit:    int = Query(default=50, le=200),
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
    if hotel_id: q += " AND hotel_id = :hotel_id"; params["hotel_id"] = hotel_id
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


@router.get("", summary="List assets")
def list_assets_root(
    hotel_id: Optional[str] = None,
    category: Optional[str] = None,
    status:   Optional[str] = None,
    skip:     int = 0,
    limit:    int = Query(default=50, le=200),
    db: Session = Depends(get_db),
):
    q = "SELECT * FROM assets WHERE 1=1"
    params: dict = {}
    if hotel_id: q += " AND hotel_id = :hotel_id"; params["hotel_id"] = hotel_id
    if category: q += " AND category = :category"; params["category"] = category
    if status:   q += " AND status = :status";     params["status"]   = status
    q += " ORDER BY name ASC LIMIT :limit OFFSET :skip"
    params["limit"] = limit; params["skip"] = skip
    rows = db.execute(text(q), params).fetchall()
    return [row_to_dict(r) for r in rows]

@router.get("/tree", summary="Asset hierarchy tree")
def asset_tree(hotel_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = "SELECT * FROM assets WHERE 1=1"
    params: dict = {}
    if hotel_id: q += " AND hotel_id = :hotel_id"; params["hotel_id"] = hotel_id
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
    now      = datetime.datetime.utcnow()
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
    return get_asset(asset_id, db)

@router.patch("/{asset_id}", summary="Update asset")
def update_asset(asset_id: str, data: dict, db: Session = Depends(get_db)):
    allowed = {"name","category","manufacturer","model","serial_number","location_description","service_frequency","criticality","status","notes"}
    updates = {k:v for k,v in data.items() if k in allowed and v is not None}
    if not updates: raise HTTPException(400, "No valid fields")
    updates["updated_at"] = datetime.datetime.utcnow()
    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["id"] = asset_id
    db.execute(text(f"UPDATE assets SET {set_clause} WHERE id = :id"), updates)
    db.commit()
    return get_asset(asset_id, db)

@router.get("/{asset_id}/work-orders", summary="Asset work orders")
def asset_work_orders(asset_id: str, db: Session = Depends(get_db)):
    rows = db.execute(text(
        "SELECT * FROM work_orders WHERE asset_id = :id ORDER BY created_at DESC LIMIT 20"
    ), {"id": asset_id}).fetchall()
    return [row_to_dict(r) for r in rows]