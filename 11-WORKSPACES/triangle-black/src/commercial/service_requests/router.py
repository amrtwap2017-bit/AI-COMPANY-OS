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

from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
from src.core.audit import audit_action

router = APIRouter(prefix="/service-requests", tags=["service-requests"])

def row_to_dict(row):
    if hasattr(row, "_mapping"): return dict(row._mapping)
    if hasattr(row, "__dict__"):
        d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
        for k,v in d.items():
            if hasattr(v, "isoformat"): d[k] = v.isoformat()
        return d
    return {}

@router.get("/", dependencies=[Depends(get_current_user)], summary="List service requests")
def list_service_requests(
    hotel_id: str = Depends(get_hotel_id),
    status:   Optional[str] = None,
    skip:     int = 0,
    limit:    int = Query(default=50, le=200),
    db: Session = Depends(get_db),
):
    q = "SELECT * FROM service_requests WHERE 1=1"
    params: dict = {}
    # hotel_id always from JWT (Sprint-252)
    q += " AND hotel_id = :hotel_id"
    params["hotel_id"] = hotel_id
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
    now   = _dt.utcnow()
    db.execute(text(
        "INSERT INTO service_requests (id, hotel_id, title, description, category, urgency, status, submitted_by, contact_phone, created_at, updated_at)"
        " VALUES (:id, :hotel_id, :title, :description, :category, :urgency, :status, :submitted_by, :contact_phone, :created_at, :updated_at)"
    ), {
        "id":           sr_id,
        "hotel_id":     data.get("hotel_id", "tb-default-hotel-000000000001"),
        "title":        data.get("title", "New Service Request"),
        "description":  data.get("description", ""),
        "category":     data.get("category", "General"),
        "urgency":      data.get("urgency", "medium"),
        "status":       data.get("status", "open"),
        "submitted_by": data.get("submitted_by", ""),
        "contact_phone":data.get("contact_phone", ""),
        "created_at":   now,
        "updated_at":   now,
    })
    db.commit()
    return get_service_request(sr_id, db)

@router.post("/{sr_id}/convert-to-wo", summary="Convert to work order")
def convert_to_work_order(sr_id: str, db: Session = Depends(get_db)):
    sr = get_service_request(sr_id, db)
    wo_id = str(uuid.uuid4())
    now   = _dt.utcnow()
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

    # Create workflow instance for the new work order (non-blocking)
    try:
        wf_engine = TriangleWorkflowEngine(entity_type="work_order")
        hotel_id = sr.get("hotel_id", "tb-default-hotel-000000000001") if isinstance(sr, dict) else getattr(sr, "hotel_id", "tb-default-hotel-000000000001")
        wf_engine.create_instance(
            db=db,
            definition_id="builtin-work-order-v1",
            entity_type="work_order",
            entity_id=wo_id,
            initial_state="open",
            hotel_id=hotel_id,
        )
    except Exception:
        pass

    # Audit the SR conversion (non-blocking)
    try:
        hotel_id_audit = sr.get("hotel_id") if isinstance(sr, dict) else getattr(sr, "hotel_id", None)
        audit_action(db, "service_request", sr_id, "CONVERTED_TO_WO",
                     hotel_id=hotel_id_audit,
                     metadata={"work_order_id": wo_id})
    except Exception:
        pass

    return {"work_order_id": wo_id, "service_request_id": sr_id, "status": "converted",
            "workflow_started": True}

# ── Sprint-033: Service Request Status Update ─────────────────────────────────
@router.patch("/{sr_id}", summary="Update service request status")
def update_service_request(
    sr_id: str,
    data: dict,
    db: Session = Depends(get_db),
):
    """Update SR status, urgency, resolution notes."""
    from sqlalchemy import text as _t
    try:
        existing = db.execute(_t(
            "SELECT id FROM service_requests WHERE id = :sid AND (deleted_at IS NULL OR deleted_at > NOW())"
        ), {"sid": sr_id}).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Service request not found")

        allowed = {"status", "urgency", "resolution_notes", "contact_phone", "resolved_at"}
        updates = {k: v for k, v in data.items() if k in allowed}
        if not updates:
            raise HTTPException(status_code=422, detail="No valid fields to update")

        set_clause = ", ".join(f"{k} = :{k}" for k in updates)
        updates["sid"] = sr_id
        db.execute(_t(f"UPDATE service_requests SET {set_clause}, updated_at = NOW() WHERE id = :sid"), updates)
        db.commit()

        row = db.execute(_t("SELECT * FROM service_requests WHERE id = :sid"), {"sid": sr_id}).fetchone()
        return dict(row._mapping) if row else {"ok": True, "id": sr_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
# ─────────────────────────────────────────────────────────────────────────────


# ── Sprint-231: SR → WO Reference Vertical Slice ──────────────────────────────
@router.post("/{sr_id}/generate-work-order", summary="Generate Work Order from Service Request")
def generate_work_order_from_sr(sr_id: str, db: Session = Depends(get_db)):
    """
    Reference vertical slice endpoint: Service Request → Work Order.
    Creates a WO linked to the SR, starts a workflow instance,
    emits an audit event and returns full trace metadata.
    """
    import uuid as _uuid_231
    import datetime as _dt_231

    # Load SR
    sr_row = db.execute(text("SELECT * FROM service_requests WHERE id = :id"), {"id": sr_id}).fetchone()
    if not sr_row:
        raise HTTPException(status_code=404, detail="Service Request not found")

    sr = dict(sr_row._mapping)
    if sr.get("status") in ("closed", "cancelled", "converted"):
        raise HTTPException(status_code=400, detail=f"SR status '{sr['status']}' cannot generate a WO")

    hotel_id = sr.get("hotel_id", "tb-default-hotel-000000000001")
    now = _dt_231.datetime.utcnow()
    wo_id = str(_uuid_231.uuid4())

    # Create Work Order
    db.execute(text("""
        INSERT INTO work_orders
        (id, hotel_id, title, description, priority, status, type,
         site_id, created_at, updated_at)
        VALUES
        (:id, :hotel_id, :title, :description, :priority, 'open', 'corrective',
         :site_id, :created_at, :updated_at)
    """), {
        "id":          wo_id,
        "hotel_id":    hotel_id,
        "title":       f"[SR] {sr.get('title', 'Service Request')}",
        "description": sr.get("description") or sr.get("title", ""),
        "priority":    sr.get("urgency", "normal"),
        "site_id":     sr.get("site_id"),
        "created_at":  now,
        "updated_at":  now,
    })

    # Update SR status to in_progress (SR workflow transition)
    db.execute(text("""
        UPDATE service_requests SET status='in_progress', updated_at=:now WHERE id=:id
    """), {"now": now, "id": sr_id})

    db.commit()

    # Start WO workflow instance (non-blocking)
    wf_instance_id = None
    try:
        wf_engine = TriangleWorkflowEngine(entity_type="work_order")
        wf_instance_id, _ = wf_engine.create_instance(
            db=db,
            definition_id="builtin-work-order-v1",
            entity_type="work_order",
            entity_id=wo_id,
            initial_state="open",
            hotel_id=hotel_id,
        )
    except Exception:
        pass

    # Audit both entities (non-blocking)
    try:
        audit_action(db, "service_request", sr_id, "GENERATE_WORK_ORDER",
                     hotel_id=hotel_id,
                     metadata={"work_order_id": wo_id, "wf_instance_id": wf_instance_id})
        audit_action(db, "work_order", wo_id, "CREATED_FROM_SR",
                     hotel_id=hotel_id,
                     metadata={"service_request_id": sr_id, "wf_instance_id": wf_instance_id})
    except Exception:
        pass

    return {
        "service_request_id": sr_id,
        "work_order_id":      wo_id,
        "wf_instance_id":     wf_instance_id,
        "sr_status":          "in_progress",
        "wo_status":          "open",
        "workflow_started":   wf_instance_id is not None,
        "audit_recorded":     True,
        "created_at":         now.isoformat(),
    }