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
from src.core.auth import get_current_user
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/workflow", tags=["workflow-engine"], dependencies=[Depends(get_current_user)])


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
    current_user=Depends(get_current_user),
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
    current_user=Depends(get_current_user),
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
    current_user=Depends(get_current_user),
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
    current_user=Depends(get_current_user),
):
    """Return workflow KPIs — single aggregated SQL query (Sprint-248 optimization)."""
    try:
        row = db.execute(text("""
            SELECT
                COUNT(*)                                                        AS total_instances,
                SUM(CASE WHEN status = 'active'       THEN 1 ELSE 0 END)       AS active_instances,
                SUM(CASE WHEN status = 'completed'    THEN 1 ELSE 0 END)       AS completed_instances,
                SUM(CASE WHEN status = 'failed'       THEN 1 ELSE 0 END)       AS failed_instances,
                SUM(CASE WHEN entity_type='work_order'       THEN 1 ELSE 0 END) AS work_order_instances,
                SUM(CASE WHEN entity_type='service_request'  THEN 1 ELSE 0 END) AS sr_instances
            FROM workflow_instances
            WHERE hotel_id = :hotel_id
        """), {"hotel_id": hotel_id}).fetchone()

        d = dict(row._mapping) if row else {}

        try:
            transitions = db.execute(text(
                "SELECT COUNT(*) FROM workflow_transitions WHERE hotel_id = :h"
            ), {"h": hotel_id}).fetchone()
            total_transitions = int(transitions[0]) if transitions else 0
        except Exception:
            total_transitions = 0

        try:
            definitions = db.execute(text(
                "SELECT COUNT(*) FROM workflow_definitions WHERE hotel_id = :h"
            ), {"h": hotel_id}).fetchone()
            total_definitions = int(definitions[0]) if definitions else 0
        except Exception:
            total_definitions = 0

        return {
            "hotel_id":             hotel_id,
            "total_instances":      int(d.get("total_instances") or 0),
            "active_instances":     int(d.get("active_instances") or 0),
            "completed_instances":  int(d.get("completed_instances") or 0),
            "failed_instances":     int(d.get("failed_instances") or 0),
            "total_transitions":    total_transitions,
            "total_definitions":    total_definitions,
            "work_order_instances": int(d.get("work_order_instances") or 0),
            "sr_instances":         int(d.get("sr_instances") or 0),
            "generated_at":         _now().isoformat(),
        }
    except Exception as e:
        return {
            "hotel_id": hotel_id, "total_instances": 0, "active_instances": 0,
            "completed_instances": 0, "failed_instances": 0, "total_transitions": 0,
            "total_definitions": 0, "work_order_instances": 0, "sr_instances": 0,
            "generated_at": _now().isoformat(), "error": str(e),
        }


@router.post("/evaluate-policy", tags=["workflow_engine"])
def evaluate_workflow_policy(
    payload: dict,
    hotel_id: str = Depends(get_hotel_id)
):
    """Evaluates transition requirements against financial thresholds."""
    from src.commercial.workflow_engine.policy import WorkflowPolicyEngine
    entity_type = payload.get("entity_type", "work_order")
    amount = float(payload.get("amount", 0.0))
    current_state = payload.get("current_state", "draft")

    result = WorkflowPolicyEngine.evaluate_approval_policy(
        hotel_id=hotel_id,
        entity_type=entity_type,
        amount=amount,
        current_state=current_state
    )
    result["hotel_id"] = hotel_id
    return result


# ── V7-009: GOVERNED TRANSITIONS ─────────────────────────────────────────────

@router.get("/instances/{instance_id}/available-transitions",
           summary="What transitions can this actor do?")
def get_available_transitions(
    instance_id: str,
    actor_role: str = "manager",
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    V7-009: Returns available workflow transitions for the current actor.
    Filters by role — a technician sees different options than a manager.
    Shows: requires_reason, requires_technician flags.
    """
    from src.commercial.workflow_engine.transition_service import GovernedTransitionService
    svc = GovernedTransitionService(db=db, hotel_id=hotel_id)
    return svc.get_available_transitions(instance_id=instance_id, actor_role=actor_role)


@router.post("/instances/{instance_id}/transition",
            summary="Execute a governed workflow state transition")
def execute_governed_transition(
    instance_id: str,
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    V7-009: Governed workflow transition.

    Every transition is:
    - Authenticated (who)
    - Authorized (role check)
    - Validated (state machine check)
    - Audited (immutable audit trail)
    - Recorded (workflow event)

    Required: to_state
    Optional: reason (required for: cancelled, escalated, waiting_parts)
              entity_id (to update entity status table)

    Returns: success, from_state, to_state, audited, governance
    """
    from src.commercial.workflow_engine.transition_service import GovernedTransitionService
    svc = GovernedTransitionService(db=db, hotel_id=hotel_id)

    actor_id = getattr(current_user, "id", "") or getattr(current_user, "sub", "unknown")
    actor_name = getattr(current_user, "name", "") or getattr(current_user, "email", "unknown")
    actor_role = getattr(current_user, "role", "manager") or "manager"

    return svc.execute_governed_transition(
        instance_id=instance_id,
        to_state=payload.get("to_state", ""),
        actor_id=actor_id,
        actor_name=actor_name,
        actor_role=payload.get("actor_role", actor_role),
        reason=payload.get("reason"),
        entity_id=payload.get("entity_id"),
    )


@router.get("/instances/{instance_id}/history",
           summary="Workflow transition history with audit trail")
def get_instance_history(
    instance_id: str,
    limit: int = 20,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    V7-009: Full transition history for a workflow instance.
    Reads from the immutable audit trail in platform_audit_log.
    Shows: who changed what state, when, with what reason.
    """
    from src.commercial.workflow_engine.transition_service import GovernedTransitionService
    svc = GovernedTransitionService(db=db, hotel_id=hotel_id)
    return svc.get_instance_history(instance_id=instance_id, limit=limit)

