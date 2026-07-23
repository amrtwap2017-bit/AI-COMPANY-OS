from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
InventoryItem FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import InventoryItemCreate, InventoryItemUpdate, InventoryItemResponse
from .repository import InventoryItemRepository

router = APIRouter(prefix="/inventory/items", tags=["inventory-items"])

@router.post("/", response_model=InventoryItemResponse, status_code=201)
def create(
    payload: InventoryItemCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return InventoryItemRepository(db).create(data)

@router.get("/", response_model=List[InventoryItemResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return InventoryItemRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{item_id}", response_model=InventoryItemResponse)
def get(
    item_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = InventoryItemRepository(db).get(item_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="InventoryItem not found")
    return obj

@router.patch("/{item_id}", response_model=InventoryItemResponse)
def update(
    item_id: str,
    payload: InventoryItemUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = InventoryItemRepository(db).update(
        item_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="InventoryItem not found")
    return obj

@router.delete("/{item_id}", status_code=204)
def delete(
    item_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not InventoryItemRepository(db).delete(item_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="InventoryItem not found")

def _safe_int(v):
    try: return int(v or 0)
    except: return 0
import uuid
import datetime


# ── S74-02: Inventory Reorder Automation (Program F + I) ──────────────────────

@router.get("/reorder-alerts", summary="Items below minimum stock")
def reorder_alerts(db: Session = Depends(get_db)):
    """Returns items that need reordering with suggested vendors."""
    try:
        rows = db.execute(text("""
            SELECT ii.id, ii.name, ii.category, ii.item_code,
                   ii.min_stock, ii.reorder_qty, ii.unit_of_measure,
                   COALESCE(sb.quantity, 0) as current_stock,
                   COALESCE(sb.quantity, 0) - ii.min_stock as shortage,
                   w.name as warehouse_name
            FROM inventory_items ii
            LEFT JOIN stock_balances sb ON sb.item_id = ii.id
            LEFT JOIN warehouses w ON w.id = sb.warehouse_id
            WHERE COALESCE(sb.quantity, 0) <= ii.min_stock
            ORDER BY (ii.min_stock - COALESCE(sb.quantity, 0)) DESC
            LIMIT 50
        """)).fetchall()
    except Exception as e:
        return {"alerts": [], "total": 0, "error": str(e)}

    alerts = []
    for row in rows:
        r = row_to_dict(row)
        # Find vendors for this category
        try:
            vendors = db.execute(text("""
                SELECT id, name, lead_time_days
                FROM inventory_vendors
                WHERE lower(category) LIKE :cat
                LIMIT 3
            """), {"cat": f"%{(r.get('category') or '').lower()}%"}).fetchall()
            r["suggested_vendors"] = [row_to_dict(v) for v in vendors]
        except Exception:
            r["suggested_vendors"] = []
        alerts.append(r)

    return {
        "alerts": alerts,
        "total": len(alerts),
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }

@router.post("/auto-reorder", summary="Create PRs for all below-minimum items")
def auto_reorder(data: dict, db: Session = Depends(get_db)):
    """
    Automatically creates Purchase Requests for all items below minimum stock.
    Called by the reorder automation engine.
    """
    requested_by = data.get("requested_by", "system_auto_reorder")
    now = datetime.datetime.utcnow()

    try:
        rows = db.execute(text("""
            SELECT ii.id, ii.name, ii.category, ii.min_stock,
                   ii.reorder_qty, ii.unit_of_measure,
                   ii.hotel_id,
                   COALESCE(sb.quantity, 0) as current_stock
            FROM inventory_items ii
            LEFT JOIN stock_balances sb ON sb.item_id = ii.id
            WHERE COALESCE(sb.quantity, 0) <= ii.min_stock
        """)).fetchall()
    except Exception as e:
        return {"success": False, "error": str(e), "prs_created": 0}

    prs_created = []
    for row in rows:
        item = row_to_dict(row)
        pr_id = str(uuid.uuid4())
        qty_needed = max(
            _safe_int(item.get("reorder_qty")),
            _safe_int(item.get("min_stock")) - _safe_int(item.get("current_stock"))
        )

        try:
            db.execute(text("""
                INSERT INTO purchase_requests
                    (id, hotel_id, title, description, status,
                     requested_by, required_date, created_at, updated_at)
                VALUES
                    (:id, :hotel_id, :title, :desc, 'submitted',
                     :requested_by, :required_date, :now, :now)
            """), {
                "id":           pr_id,
                "hotel_id":     item.get("hotel_id"),
                "title":        f"AUTO-REORDER: {item.get('name')} x{qty_needed}",
                "desc":         f"Auto-generated. Current stock: {item.get('current_stock')} "
                               f"Min: {item.get('min_stock')} Reorder qty: {qty_needed} "
                               f"Unit: {item.get('unit_of_measure')}",
                "requested_by": requested_by,
                "required_date": now + datetime.timedelta(days=7),
                "now":          now,
            })
            prs_created.append({
                "pr_id": pr_id,
                "item":  item.get("name"),
                "qty":   qty_needed,
            })
        except Exception:
            pass

    if prs_created:
        db.commit()

    return {
        "success":     True,
        "prs_created": len(prs_created),
        "items":       prs_created,
        "message":     f"{len(prs_created)} purchase requests auto-created",
        "triggered_by": requested_by,
    }
