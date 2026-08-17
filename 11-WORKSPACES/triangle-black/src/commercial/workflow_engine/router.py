"""
Triangle Black — Workflow Engine Admin API (Sprint-240)
Provides visibility into workflow instances and transition history.
All endpoints are hotel-scoped. Read-only admin endpoints.

Routes:
  GET /api/v1/workflow/instances           — list active workflow instances
  GET /api/v1/workflow/instances/{id}      — get one instance + transitions
  GET /api/v1/workflow/instances/{id}/transitions — get transition history
  GET /api/v1/workflow/definitions         — list workflow definitions
  POST /api/v1/workflow/definitions        — create workflow definition
  GET /api/v1/workflow/stats               — summary stats per hotel
"""
from __future__ import annotations
import uuid
import json
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/workflow", tags=["workflow-engine"])


def _now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _row(r) -> dict:
    if r is None:
        return {}
    if hasattr(r, "_mapping"):
        d = dict(r._mapping)
        for k, v in d.items():
            if hasattr(v, "isoformat"):
                d[k] = v.isoformat()
        return d
    return {}


# ── GET /workflow/instances ───────────────────────────────────────────────────
@router.get("/instances", summary="List workflow instances")
def list_instances(
    hotel_id:    str = Depends(get_hotel_id),
    entity_type: Optional[str] = Query(None),
    entity_id:   Optional[str] = Query(None),
    status:      Optional[str] = Query(None, description="active|completed|failed|cancelled"),
    limit:       int = Query(50, ge=1, le=200),
    skip:        int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List workflow instances scoped to current hotel."""
    q = "SELECT * FROM workflow_instances WHERE hotel_id = :hotel_id"
    params: dict = {"hotel_id": hotel_id}

    if entity_type:
        q += " AND entity_type = :entity_type"
        params["entity_type"] = entity_type
    if entity_id:
        q += " AND entity_id = :entity_id"
        params["entity_id"] = entity_id
    if status:
        q += " AND status = :status"
        params["status"] = status

    q += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    params["limit"] = limit
    params["skip"]  = skip

    try:
        rows = db.execute(text(q), params).fetchall()
        return {
            "hotel_id": hotel_id,
            "count":    len(rows),
            "results":  [_row(r) for r in rows],
        }
    except Exception as e:
        return {"hotel_id": hotel_id, "count": 0, "results": [], "error": str(e)}


# ── GET /workflow/instances/{id} ──────────────────────────────────────────────
@router.get("/instances/{instance_id}", summary="Get workflow instance detail")
def get_instance(
    instance_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Get one workflow instance with its full transition history."""
    try:
        row = db.execute(text(
            "SELECT * FROM workflow_instances WHERE id = :id AND hotel_id = :hotel_id"
        ), {"id": instance_id, "hotel_id": hotel_id}).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Workflow instance not found")

        instance = _row(row)

        # Load transition history
        transitions = db.execute(text("""
            SELECT * FROM workflow_transitions
            WHERE instance_id = :id
            ORDER BY created_at ASC
        """), {"id": instance_id}).fetchall()

        instance["transitions"] = [_row(t) for t in transitions]
        instance["transition_count"] = len(transitions)

        return instance

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /workflow/instances/{id}/transitions ──────────────────────────────────
@router.get("/instances/{instance_id}/transitions",
            summary="Get transition history for workflow instance")
def get_transitions(
    instance_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Get all state transitions for a workflow instance."""
    try:
        # Verify instance belongs to hotel
        inst = db.execute(text(
            "SELECT id FROM workflow_instances WHERE id = :id AND hotel_id = :hotel_id"
        ), {"id": instance_id, "hotel_id": hotel_id}).fetchone()

        if not inst:
            raise HTTPException(status_code=404, detail="Workflow instance not found")

        rows = db.execute(text("""
            SELECT * FROM workflow_transitions
            WHERE instance_id = :id
            ORDER BY created_at ASC
        """), {"id": instance_id}).fetchall()

        return {
            "instance_id": instance_id,
            "count":       len(rows),
            "transitions": [_row(r) for r in rows],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /workflow/definitions ─────────────────────────────────────────────────
@router.get("/definitions", summary="List workflow definitions")
def list_definitions(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """List workflow definitions for this hotel."""
    try:
        rows = db.execute(text(
            "SELECT * FROM workflow_definitions WHERE hotel_id = :hotel_id ORDER BY created_at DESC"
        ), {"hotel_id": hotel_id}).fetchall()

        return {
            "hotel_id": hotel_id,
            "count":    len(rows),
            "results":  [_row(r) for r in rows],
        }
    except Exception as e:
        return {"hotel_id": hotel_id, "count": 0, "results": [], "error": str(e)}


# ── POST /workflow/definitions ────────────────────────────────────────────────
@router.post("/definitions", status_code=201, summary="Create workflow definition")
def create_definition(
    data: dict,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Create a custom workflow definition for this hotel."""
    name        = data.get("name", "Custom Workflow")
    entity_type = data.get("entity_type", "work_order")
    states      = data.get("states", {})
    version     = data.get("version", "1.0")

    def_id = str(uuid.uuid4())
    now    = _now()

    try:
        db.execute(text("""
            INSERT INTO workflow_definitions
            (id, hotel_id, name, entity_type, version, state_machine_json, is_active, created_at, updated_at)
            VALUES
            (:id, :hotel_id, :name, :entity_type, :version, :json, 'true', :now, :now)
        """), {
            "id":          def_id,
            "hotel_id":    hotel_id,
            "name":        name,
            "entity_type": entity_type,
            "version":     version,
            "json":        json.dumps({"states": states}),
            "now":         now,
        })
        db.commit()
        return {
            "id":          def_id,
            "hotel_id":    hotel_id,
            "name":        name,
            "entity_type": entity_type,
            "version":     version,
            "created_at":  now.isoformat(),
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /workflow/stats ───────────────────────────────────────────────────────
@router.get("/stats", summary="Workflow statistics for current hotel")
def workflow_stats(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Return workflow KPIs — active/completed/failed counts per entity type."""
    def safe(q: str, params: dict = None) -> int:
        try:
            row = db.execute(text(q), params or {}).fetchone()
            return int(row[0]) if row else 0
        except Exception:
            return 0

    p = {"hotel_id": hotel_id}
    return {
        "hotel_id":              hotel_id,
        "total_instances":       safe("SELECT count(*) FROM workflow_instances WHERE hotel_id=:hotel_id", p),
        "active_instances":      safe("SELECT count(*) FROM workflow_instances WHERE hotel_id=:hotel_id AND status='active'", p),
        "completed_instances":   safe("SELECT count(*) FROM workflow_instances WHERE hotel_id=:hotel_id AND status='completed'", p),
        "failed_instances":      safe("SELECT count(*) FROM workflow_instances WHERE hotel_id=:hotel_id AND status='failed'", p),
        "total_transitions":     safe("SELECT count(*) FROM workflow_transitions WHERE hotel_id=:hotel_id", p),
        "total_definitions":     safe("SELECT count(*) FROM workflow_definitions WHERE hotel_id=:hotel_id", p),
        "work_order_instances":  safe("SELECT count(*) FROM workflow_instances WHERE hotel_id=:hotel_id AND entity_type='work_order'", p),
        "sr_instances":          safe("SELECT count(*) FROM workflow_instances WHERE hotel_id=:hotel_id AND entity_type='service_request'", p),
        "generated_at":          _now().isoformat(),
    }
