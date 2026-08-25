from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query
from src.core.auth import get_current_user
from src.commercial.auth.models import User
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from typing import Optional, List
import uuid, datetime
from src.core.events import emit_event, EventType
from src.core.sla_scanner import scan_and_emit_sla_breaches
from src.core.audit import audit_create, audit_update, audit_delete

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
    hotel_id:      str = Depends(get_hotel_id),
    status:        Optional[str] = None,
    priority:      Optional[str] = None,
    technician_id: Optional[str] = None,
    skip:          int = 0,
    limit:         int = Query(default=50, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    # Sprint-198: Cache-aside for work-orders list
    try:
        from src.core.cache import cache_get, cache_set, make_cache_key
        _hid = hotel_id or "tb-default-hotel-000000000001"
        _ck = make_cache_key("work-orders", _hid,
            status=status, priority=priority,
            technician_id=technician_id, skip=skip, limit=limit)
        cached = cache_get(_ck)
        if cached is not None:
            return cached
    except Exception:
        _ck = None

    q = "SELECT * FROM work_orders WHERE 1=1"
    params: dict = {}
    # hotel_id always present from JWT (Sprint-249B tenant isolation)
    q += " AND hotel_id = :hotel_id"
    params["hotel_id"] = hotel_id
    if status:        q += " AND status = :status";               params["status"]        = status
    if priority:      q += " AND priority = :priority";           params["priority"]      = priority
    if technician_id: q += " AND technician_id = :technician_id"; params["technician_id"] = technician_id
    q += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    params["limit"] = limit; params["skip"] = skip
    rows = db.execute(text(q), params).fetchall()
    result = [row_to_dict(r) for r in rows]

    try:
        if _ck:
            from src.core.cache import cache_set
            cache_set(_ck, result, ttl=60)
    except Exception:
        pass

    return result


@router.get("/", dependencies=[Depends(get_current_user)], summary="List work orders")
def list_work_orders_root(
    hotel_id:      str = Depends(get_hotel_id),
    status:        Optional[str] = None,
    priority:      Optional[str] = None,
    technician_id: Optional[str] = None,
    skip:          int = 0,
    limit:         int = Query(default=500, le=1000),
    db: Session = Depends(get_db),
):
    q = "SELECT * FROM work_orders WHERE 1=1"
    params: dict = {}
    # hotel_id always present from JWT (Sprint-249B tenant isolation)
    q += " AND hotel_id = :hotel_id"
    params["hotel_id"] = hotel_id
    if status:        q += " AND status = :status";               params["status"]        = status
    if priority:      q += " AND priority = :priority";           params["priority"]      = priority
    if technician_id: q += " AND technician_id = :technician_id"; params["technician_id"] = technician_id
    q += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    params["limit"] = limit; params["skip"] = skip
    rows = db.execute(text(q), params).fetchall()
    return [row_to_dict(r) for r in rows]


@router.get("/sla-breached")
def get_sla_breached_work_orders(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = 50,
    skip: int = 0
):
    """Return all work orders with SLA breach — T-003"""
    try:
        # Auto-scan for new breaches before returning list (T-019)
        try:
            scan_and_emit_sla_breaches(db=db, hotel_id=hotel_id, actor="auto_scan")
        except Exception:
            pass
        from sqlalchemy import text as _text
        rows = db.execute(_text(
            """SELECT id, title, status, sla_hours, sla_breach_at,
                      sla_breached, sla_status, priority, hotel_id
               FROM work_orders
               WHERE hotel_id = :hid
                 AND sla_breached = TRUE
                 AND deleted_at IS NULL
               ORDER BY sla_breach_at ASC
               LIMIT :lim OFFSET :sk"""
        ), {"hid": hotel_id, "lim": limit, "sk": skip}).fetchall()
        results = [dict(r._mapping) for r in rows]
        return {"count": len(results), "results": results, "hotel_id": hotel_id}
    except Exception as e:
        return {"count": 0, "results": [], "hotel_id": hotel_id, "error": str(e)}


@router.get("/sla-summary")
def get_sla_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """SLA compliance summary — T-003"""
    try:
        from sqlalchemy import text as _text
        row = db.execute(_text(
            """SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN sla_status = 'met' THEN 1 ELSE 0 END) AS met,
                SUM(CASE WHEN sla_status = 'breached' THEN 1 ELSE 0 END) AS breached,
                SUM(CASE WHEN sla_status = 'on_track' THEN 1 ELSE 0 END) AS on_track,
                ROUND(
                    100.0 * SUM(CASE WHEN sla_status = 'met' THEN 1 ELSE 0 END)
                    / NULLIF(COUNT(*), 0), 1
                ) AS compliance_pct
               FROM work_orders
               WHERE hotel_id = :hid AND deleted_at IS NULL"""
        ), {"hid": hotel_id}).fetchone()
        d = dict(row._mapping) if row else {}
        d["hotel_id"] = hotel_id
        return d
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)}


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
    try:
        audit_create(db, "work_order", wo_id,
                     hotel_id=data.get("hotel_id"),
                     metadata={"title": data.get("title"), "priority": data.get("priority"), "type": data.get("type")})
    except Exception:
        pass
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
    try:
        audit_update(db, "work_order", work_order_id,
                     new_value={k: v for k, v in data.items() if k in allowed and v is not None})
    except Exception:
        pass
    return get_work_order(work_order_id, db)

@router.delete("/{work_order_id}", status_code=204, summary="Delete work order")
def delete_work_order(work_order_id: str, db: Session = Depends(get_db)):
    db.execute(text("DELETE FROM work_orders WHERE id = :id"), {"id": work_order_id})
    db.commit()
    try:
        audit_delete(db, "work_order", work_order_id)
    except Exception:
        pass

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


# ── Sprint-022: Work Order Complete + Auto-Invoice ────────────────────────────
from datetime import datetime, timedelta
import uuid as _uuid



# ── Sprint-022: Work Order Complete + Auto-Invoice ────────────────────────────
from datetime import datetime as _dt, timedelta as _td
import uuid as _uuid2


@router.post("/{wo_id}/complete", summary="Complete work order and auto-create draft invoice")
def complete_work_order(wo_id: str, db: Session = Depends(get_db)):
    """
    Mark WO as completed. Auto-create a draft invoice (idempotent).
    No hotel_id required — uses hotel_id from the WO record itself.
    """
    from sqlalchemy import text as _t

    # Load WO (no hotel_id filter — WO hotel_id comes from the record)
    row = None
    try:
        row = db.execute(_t(
            "SELECT CAST(id AS TEXT) as id, hotel_id, title, status "
            "FROM work_orders WHERE CAST(id AS TEXT) = :wid"
        ), {"wid": wo_id}).fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")

    if not row:
        raise HTTPException(status_code=404, detail="Work order not found")

    wo_hotel = row[1] or "tb-default-hotel-000000000001"
    wo_status = row[3]
    inv_num = f"AUTO-{wo_id[:8]}"

    # If already completed — return existing invoice
    if wo_status == "completed":
        existing = None
        try:
            existing = db.execute(_t(
                "SELECT id FROM invoices WHERE invoice_number = :n"
            ), {"n": inv_num}).fetchone()
        except Exception:
            pass
        return {
            "ok": True, "work_order_id": wo_id, "status": "completed",
            "invoice_id": existing[0] if existing else None,
            "invoice_number": inv_num, "message": "Already completed",
        }

    # Update WO status
    try:
        db.execute(_t(
            "UPDATE work_orders SET status = 'completed', updated_at = NOW() "
            "WHERE CAST(id AS TEXT) = :wid"
        ), {"wid": wo_id})
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {e}")

    # Auto-create draft invoice (idempotent)
    inv_id = None
    try:
        existing = db.execute(_t(
            "SELECT id FROM invoices WHERE invoice_number = :n"
        ), {"n": inv_num}).fetchone()
        if not existing:
            inv_id = str(_uuid2.uuid4())
            due = (_dt.utcnow() + _td(days=30)).date()
            db.execute(_t(
                "INSERT INTO invoices (id, hotel_id, invoice_number, total_amount, status, due_date, created_at) "
                "VALUES (:id, :hid, :num, 0, 'draft', :due, NOW())"
            ), {"id": inv_id, "hid": wo_hotel, "num": inv_num, "due": due})
        else:
            inv_id = existing[0]
        db.commit()
    except Exception as e:
        db.rollback()
        inv_id = "error"

    return {
        "ok": True, "work_order_id": wo_id, "status": "completed",
        "invoice_id": inv_id, "invoice_number": inv_num,
        "message": "Completed. Draft invoice created.",
    }
# ─────────────────────────────────────────────────────────────────────────────
    # ── 1. Load + validate work order ─────────────────────────────────────────
    wo_row = db.execute(text("""
        SELECT id, hotel_id, title, status
        FROM work_orders
        WHERE CAST(id AS TEXT) = :wo_id
    """), {"wo_id": wo_id, "hid": hotel_id}).fetchone()

    if not wo_row:
        raise HTTPException(status_code=404, detail="Work order not found")

    wo = dict(wo_row._mapping)

    if wo["status"] == "completed":
        # Already completed — check if invoice exists
        inv_check = db.execute(text("""
            SELECT id FROM invoices
            WHERE hotel_id = :hid
              AND invoice_number = :inv_num
        """), {"hid": wo_row_hid, "inv_num": f"AUTO-{wo_id[:8]}"}).fetchone()

        return {
            "ok": True,
            "work_order_id": wo_id,
            "status": "completed",
            "invoice_id": inv_check[0] if inv_check else None,
            "message": "Already completed",
        }

    # ── 2. Update WO status to completed ──────────────────────────────────────
    db.execute(text("""
        UPDATE work_orders
        SET status = 'completed',
            updated_at = NOW()
        WHERE CAST(id AS TEXT) = :wo_id
    """), {"wo_id": wo_id, "hid": hotel_id})

    # ── 3. Auto-create draft invoice (idempotent check) ────────────────────────
    invoice_number = f"AUTO-{wo_id[:8]}"
    inv_id = None

    existing = db.execute(text("""
        SELECT id FROM invoices
        WHERE hotel_id = :hid AND invoice_number = :inv_num
    """), {"hid": wo["hotel_id"], "inv_num": invoice_number}).fetchone()

    if not existing:
        inv_id = str(_uuid.uuid4())
        due_date = (datetime.utcnow() + timedelta(days=30)).date()

        db.execute(text("""
            INSERT INTO invoices (
                id, hotel_id, invoice_number,
                total_amount, status, due_date, created_at
            ) VALUES (
                :id, :hid, :inv_num,
                0, 'draft', :due_date, NOW()
            )
        """), {
            "id": inv_id,
            "hid": wo["hotel_id"],
            "inv_num": invoice_number,
            "due_date": due_date,
        })
    else:
        inv_id = existing[0]

    db.commit()

    # Emit domain event to outbox (T-006)
    try:
        emit_event(db=db, hotel_id=wo["hotel_id"],
                   event_type=EventType.WO_COMPLETED,
                   aggregate_type="work_order",
                   aggregate_id=wo_id,
                   payload={"status": "completed", "invoice_id": inv_id},
                   actor=wo["hotel_id"])
    except Exception:
        pass

    return {
        "ok": True,
        "work_order_id": wo_id,
        "status": "completed",
        "invoice_id": inv_id,
        "invoice_number": invoice_number,
        "message": "Work order completed. Draft invoice created." if not existing else "Work order completed. Invoice already existed.",
    }
# ─────────────────────────────────────────────────────────────────────────────


# ── Sprint-235: WO → Service Report → Close (Reference Vertical Slice) ────────
@router.post("/{wo_id}/close", summary="Close work order with service report")
def close_work_order(wo_id: str, db: Session = Depends(get_db)):
    """
    Close a completed work order. Creates a service report record.
    Part of the SR→WO→ServiceReport→Close reference vertical slice.
    Emits workflow transition + audit event.
    """
    import uuid as _uuid_235
    import datetime as _dt_235
    from sqlalchemy import text as _t235

    row = db.execute(_t235(
        "SELECT id, hotel_id, title, status FROM work_orders WHERE id = :id"
    ), {"id": wo_id}).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Work order not found")

    wo = dict(row._mapping)
    hotel_id = wo.get("hotel_id", "tb-default-hotel-000000000001")
    now = _dt_235.datetime.utcnow()

    if wo.get("status") == "closed":
        return {"ok": True, "work_order_id": wo_id, "status": "closed",
                "message": "Already closed"}

    # Update WO status to closed
    db.execute(_t235("""
        UPDATE work_orders
        SET status='closed', completed_at=:now, updated_at=:now
        WHERE id=:id
    """), {"now": now, "id": wo_id})

    # Create service report record (non-blocking — table may not exist)
    service_report_id = None
    try:
        service_report_id = str(_uuid_235.uuid4())
        db.execute(_t235("""
            INSERT INTO service_reports
            (id, hotel_id, work_order_id, status, closed_at, created_at, updated_at)
            VALUES (:id, :hotel_id, :wo_id, 'completed', :now, :now, :now)
        """), {
            "id":       service_report_id,
            "hotel_id": hotel_id,
            "wo_id":    wo_id,
            "now":      now,
        })
    except Exception:
        service_report_id = None

    db.commit()

    # Emit domain event to outbox (T-006)
    try:
        emit_event(db=db, hotel_id=hotel_id,
                   event_type=EventType.WO_CLOSED,
                   aggregate_type="work_order",
                   aggregate_id=wo_id,
                   payload={"status": "closed", "service_report_id": service_report_id},
                   actor=hotel_id)
    except Exception:
        pass

    # Workflow transition: completed → closed (non-blocking)
    wf_transitioned = False
    try:
        from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
        wf_engine = TriangleWorkflowEngine(entity_type="work_order")
        # Find active workflow instance for this WO
        inst_row = db.execute(_t235("""
            SELECT id, current_state_key FROM workflow_instances
            WHERE entity_id = :eid AND entity_type = 'work_order'
              AND status = 'active'
            ORDER BY created_at DESC LIMIT 1
        """), {"eid": wo_id}).fetchone()

        if inst_row:
            inst = dict(inst_row._mapping)
            ok, _ = wf_engine.execute_transition(
                db=db,
                instance_id=inst["id"],
                from_state=inst.get("current_state_key", "completed"),
                to_state="closed",
                entity_type="work_order",
                entity_id=wo_id,
                hotel_id=hotel_id,
                notes="Closed via close endpoint",
            )
            wf_transitioned = ok
    except Exception:
        pass

    # Audit the closure (non-blocking)
    try:
        audit_action(db, "work_order", wo_id, "CLOSED",
                     hotel_id=hotel_id,
                     metadata={"service_report_id": service_report_id,
                               "wf_transitioned": wf_transitioned})
    except Exception:
        pass

    return {
        "ok":                True,
        "work_order_id":     wo_id,
        "status":            "closed",
        "service_report_id": service_report_id,
        "wf_transitioned":   wf_transitioned,
        "closed_at":         now.isoformat(),
    }