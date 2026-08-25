from __future__ import annotations
import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/search", tags=["global-search"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

@router.get("/", summary="Global full-text search")
def global_search(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(default=5, le=20),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Searches across: work_orders, assets, technicians,
    leads, contracts, inventory_items, projects, invoices.
    Returns ranked results grouped by entity type.
    """
    if not q or len(q.strip()) < 2:
        return {"query": q, "results": {}, "total": 0}

    term = f"%{q.strip().lower()}%"
    results = {}
    total = 0

    # Work Orders
    try:
        rows = db.execute(text("""
            SELECT id, title, status, priority, type,
                   'work_order' as entity_type,
                   '/operations/work-orders/' || id as url
            FROM work_orders
            WHERE lower(title) LIKE :term
               OR lower(description) LIKE :term
               OR lower(status) LIKE :term
            LIMIT :lim
        """), {"term": term, "lim": limit}).fetchall()
        if rows:
            results["work_orders"] = [row_to_dict(r) for r in rows]
            total += len(rows)
    except Exception:
        pass

    # Assets
    try:
        rows = db.execute(text("""
            SELECT id, name, category, status, criticality,
                   'asset' as entity_type,
                   '/maintenance/assets/' || id as url
            FROM assets
            WHERE lower(name) LIKE :term
               OR lower(category) LIKE :term
               OR lower(serial_number) LIKE :term
            LIMIT :lim
        """), {"term": term, "lim": limit}).fetchall()
        if rows:
            results["assets"] = [row_to_dict(r) for r in rows]
            total += len(rows)
    except Exception:
        pass

    # Technicians
    try:
        rows = db.execute(text("""
            SELECT id, name, is_active,
                   current_work_orders, max_work_orders,
                   'technician' as entity_type,
                   '/operations/technicians/' || id as url
            FROM technicians
            WHERE lower(name) LIKE :term
            LIMIT :lim
        """), {"term": term, "lim": limit}).fetchall()
        if rows:
            results["technicians"] = [row_to_dict(r) for r in rows]
            total += len(rows)
    except Exception:
        pass

    # Leads
    try:
        rows = db.execute(text("""
            SELECT id, title, status, priority,
                   'lead' as entity_type,
                   '/commercial/leads/' || id as url
            FROM leads
            WHERE lower(title) LIKE :term
               OR lower(status) LIKE :term
            LIMIT :lim
        """), {"term": term, "lim": limit}).fetchall()
        if rows:
            results["leads"] = [row_to_dict(r) for r in rows]
            total += len(rows)
    except Exception:
        pass

    # Contracts
    try:
        rows = db.execute(text("""
            SELECT id, title, status, total_value,
                   'contract' as entity_type,
                   '/commercial/contracts/' || id as url
            FROM contracts
            WHERE lower(title) LIKE :term
               OR lower(status) LIKE :term
            LIMIT :lim
        """), {"term": term, "lim": limit}).fetchall()
        if rows:
            results["contracts"] = [row_to_dict(r) for r in rows]
            total += len(rows)
    except Exception:
        pass

    # Inventory Items
    try:
        rows = db.execute(text("""
            SELECT id, name, category, item_code,
                   'inventory_item' as entity_type,
                   '/supply-chain/inventory/' || id as url
            FROM inventory_items
            WHERE lower(name) LIKE :term
               OR lower(item_code) LIKE :term
               OR lower(category) LIKE :term
            LIMIT :lim
        """), {"term": term, "lim": limit}).fetchall()
        if rows:
            results["inventory_items"] = [row_to_dict(r) for r in rows]
            total += len(rows)
    except Exception:
        pass

    # Projects
    try:
        rows = db.execute(text("""
            SELECT id, name, status,
                   'project' as entity_type,
                   '/projects-center/' || id as url
            FROM projects
            WHERE lower(name) LIKE :term
               OR lower(status) LIKE :term
            LIMIT :lim
        """), {"term": term, "lim": limit}).fetchall()
        if rows:
            results["projects"] = [row_to_dict(r) for r in rows]
            total += len(rows)
    except Exception:
        pass

    # Hotels
    try:
        rows = db.execute(text("""
            SELECT id, name, city,
                   'hotel' as entity_type,
                   '/administration/hotels/' || id as url
            FROM hotels
            WHERE lower(name) LIKE :term
               OR lower(city) LIKE :term
            LIMIT :lim
        """), {"term": term, "lim": limit}).fetchall()
        if rows:
            results["hotels"] = [row_to_dict(r) for r in rows]
            total += len(rows)
    except Exception:
        pass

    return {
        "query":        q,
        "total":        total,
        "entity_types": list(results.keys()),
        "results":      results,
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }

@router.get("/quick", summary="Quick search — top 3 per entity type")
def quick_search(
    q: str = Query(..., min_length=2),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Faster search — 3 results per entity, for command palette."""
    full = global_search(q=q, limit=3, db=db)
    flat = []
    for entity_type, items in full.get("results", {}).items():
        for item in items:
            flat.append({
                "type":  entity_type,
                "id":    item.get("id"),
                "label": item.get("name") or item.get("title") or str(item.get("id",""))[:8],
                "meta":  item.get("status") or item.get("category") or "",
                "url":   item.get("url", "/"),
            })
    return {
        "query":   q,
        "total":   len(flat),
        "results": flat[:15],
    }
