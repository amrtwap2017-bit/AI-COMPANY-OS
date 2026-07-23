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


@router.get("", summary="List work orders")
def list_work_orders_root(
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

# ─────────────────────────────────────────────────────────────────────────────
# S68-01: Work Order Transition Engine (Program C)
# Called by useWorkflow hook: POST /api/v1/work-orders/{id}/transition
# ─────────────────────────────────────────────────────────────────────────────

# Valid state machine for work orders
WO_TRANSITIONS = {
    "open":          ["assigned", "cancelled"],
    "assigned":      ["in_progress", "open", "cancelled"],
    "in_progress":   ["waiting_parts", "completed", "cancelled"],
    "waiting_parts": ["in_progress", "cancelled"],
    "completed":     ["closed", "in_progress"],
    "closed":        [],
    "cancelled":     [],
    # Legacy states in DB
    "pending":       ["assigned", "cancelled"],
    "new":           ["open", "cancelled"],
    "draft":         ["open", "cancelled"],
}

def _ensure_transition_log_table(db: Session):
    """Create transition_logs table if it does not exist."""
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS wo_transition_logs (
            id          VARCHAR(36) PRIMARY KEY,
            wo_id       VARCHAR(36) NOT NULL,
            from_state  VARCHAR(50) NOT NULL,
            to_state    VARCHAR(50) NOT NULL,
            triggered_by VARCHAR(36),
            comment     TEXT,
            created_at  TIMESTAMP NOT NULL
        )
    """))
    db.commit()

@router.post("/{work_order_id}/transition", summary="Transition work order state")
def transition_work_order(
    work_order_id: str,
    data: dict,
    db: Session = Depends(get_db),
):
    """
    Transition a work order to a new state.
    Body: { "to": "in_progress", "comment": "...", "technician_id": "..." }
    Uses WO_TRANSITIONS state machine to validate the move.
    """
    to_state = data.get("to", "").strip()
    if not to_state:
        raise HTTPException(400, "Field 'to' is required")

    # Load current work order
    row = db.execute(
        text("SELECT * FROM work_orders WHERE id = :id"),
        {"id": work_order_id}
    ).fetchone()
    if not row:
        raise HTTPException(404, "Work order not found")

    wo = row_to_dict(row)
    from_state = wo.get("status", "open")

    # Validate transition
    allowed = WO_TRANSITIONS.get(from_state, [])
    if to_state not in allowed:
        raise HTTPException(400, {
            "error":   "Invalid transition",
            "from":    from_state,
            "to":      to_state,
            "allowed": allowed,
        })

    # Build update payload
    now     = datetime.datetime.utcnow()
    updates = {
        "status":     to_state,
        "updated_at": now,
    }

    # Automatic field updates based on transition
    if to_state == "in_progress" and not wo.get("started_at"):
        updates["started_at"] = now
    if to_state in ("completed", "closed"):
        updates["completed_at"] = now
    if data.get("technician_id") and to_state == "assigned":
        updates["technician_id"] = data["technician_id"]

    # Apply update
    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["id"] = work_order_id
    db.execute(text(f"UPDATE work_orders SET {set_clause} WHERE id = :id"), updates)

    # Write transition log
    try:
        _ensure_transition_log_table(db)
        db.execute(text("""
            INSERT INTO wo_transition_logs
                (id, wo_id, from_state, to_state, triggered_by, comment, created_at)
            VALUES
                (:id, :wo_id, :from_state, :to_state, :triggered_by, :comment, :created_at)
        """), {
            "id":           str(uuid.uuid4()),
            "wo_id":        work_order_id,
            "from_state":   from_state,
            "to_state":     to_state,
            "triggered_by": data.get("triggered_by"),
            "comment":      data.get("comment"),
            "created_at":   now,
        })
    except Exception:
        pass  # Log failure is non-blocking

    db.commit()

    updated = row_to_dict(
        db.execute(text("SELECT * FROM work_orders WHERE id = :id"),
                   {"id": work_order_id}).fetchone()
    )
    return {
        "success":    True,
        "work_order": updated,
        "transition": {"from": from_state, "to": to_state},
        "message":    f"Work order moved from {from_state} to {to_state}",
    }


@router.get("/{work_order_id}/transitions", summary="Available transitions for work order")
def get_available_transitions(work_order_id: str, db: Session = Depends(get_db)):
    """Return which states this work order can move to from its current state."""
    row = db.execute(
        text("SELECT id, status, title FROM work_orders WHERE id = :id"),
        {"id": work_order_id}
    ).fetchone()
    if not row:
        raise HTTPException(404, "Work order not found")
    wo = row_to_dict(row)
    current = wo.get("status", "open")
    allowed = WO_TRANSITIONS.get(current, [])
    return {
        "work_order_id": work_order_id,
        "current_state": current,
        "allowed":       allowed,
        "state_machine": WO_TRANSITIONS,
    }


@router.get("/{work_order_id}/transition-log", summary="Transition history for work order")
def get_transition_log(work_order_id: str, db: Session = Depends(get_db)):
    """Return full audit trail of state changes for a work order."""
    try:
        rows = db.execute(text("""
            SELECT * FROM wo_transition_logs
            WHERE wo_id = :id
            ORDER BY created_at DESC
            LIMIT 100
        """), {"id": work_order_id}).fetchall()
        return [row_to_dict(r) for r in rows]
    except Exception:
        return []
