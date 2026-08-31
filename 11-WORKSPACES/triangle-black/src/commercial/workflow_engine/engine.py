"""
Triangle Black — Workflow Engine (Sprint-230)
Dict-based state machine. No exec(). No dynamic guards.
Runs alongside existing router-level status management — does NOT replace it yet.

Usage:
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine

    engine = TriangleWorkflowEngine(definition_json)
    ok, msg = engine.can_transition("open", "assigned")
    if ok:
        engine.execute_transition(db, instance_id, "open", "assigned",
                                  entity_type="work_order",
                                  entity_id=wo_id,
                                  hotel_id=hotel_id,
                                  triggered_by=user_id)
"""
from __future__ import annotations
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger("tb.workflow")


# ── Built-in transition maps (mirrors WO_TRANSITIONS in work_orders/router.py) ─
DEFAULT_WO_TRANSITIONS: dict = {
    "open":          ["assigned", "cancelled"],
    "assigned":      ["in_progress", "open", "cancelled"],
    "in_progress":   ["waiting_parts", "completed", "cancelled"],
    "waiting_parts": ["in_progress", "cancelled"],
    "completed":     ["closed", "in_progress"],
    "closed":        [],
    "cancelled":     [],
    "pending":       ["assigned", "cancelled"],
    "new":           ["open", "cancelled"],
    "draft":         ["open", "cancelled"],
}

DEFAULT_SR_TRANSITIONS: dict = {
    "open":        ["in_progress", "cancelled", "converted"],
    "in_progress": ["resolved", "escalated", "cancelled"],
    "escalated":   ["in_progress", "resolved", "cancelled"],
    "resolved":    ["closed"],
    "closed":      [],
    "cancelled":   [],
    "converted":   ["closed"],
}

BUILTIN_DEFINITIONS: dict = {
    "work_order":      DEFAULT_WO_TRANSITIONS,
    "service_request": DEFAULT_SR_TRANSITIONS,
}


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class TriangleWorkflowEngine:
    """
    Minimal state machine engine for Triangle Black.
    Loads transition rules from JSON definition or built-in maps.
    Never raises — all errors are logged and return (False, error_message).
    """

    def __init__(self, definition_json: Optional[str] = None,
                 entity_type: Optional[str] = None):
        """
        Args:
            definition_json: JSON string with {"states": {"from": ["to", ...]}}
            entity_type: use built-in definition if definition_json is None
        """
        self._transitions: dict = {}
        try:
            if definition_json:
                data = json.loads(definition_json)
                self._transitions = data.get("states", data)
            elif entity_type and entity_type in BUILTIN_DEFINITIONS:
                self._transitions = BUILTIN_DEFINITIONS[entity_type]
        except Exception as e:
            logger.warning(f"[workflow] Failed to load definition: {e}")

    def load_builtin(self, entity_type: str) -> None:
        """V7-009: Load built-in state machine by entity type."""
        self._transitions = BUILTIN_DEFINITIONS.get(
            entity_type, DEFAULT_WO_TRANSITIONS
        )

    def can_transition(self, from_state: str, to_state: str) -> Tuple[bool, str]:
        """
        Check if a transition from from_state to to_state is allowed.
        Returns: (True, "ok") or (False, reason)
        """
        try:
            allowed = self._transitions.get(from_state, [])
            if to_state in allowed:
                return True, "ok"
            if not allowed:
                return False, f"State '{from_state}' has no allowed transitions"
            return False, (
                f"Transition '{from_state}' → '{to_state}' not allowed. "
                f"Allowed: {allowed}"
            )
        except Exception as e:
            return False, f"Engine error: {e}"

    def get_allowed_transitions(self, from_state: str) -> list:
        """Return list of states reachable from from_state."""
        try:
            return list(self._transitions.get(from_state, []))
        except Exception:
            return []

    def execute_transition(
        self,
        db: Session,
        instance_id: str,
        from_state: str,
        to_state: str,
        entity_type: str,
        entity_id: str,
        hotel_id: Optional[str] = None,
        triggered_by: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> Tuple[bool, str]:
        """
        Execute a validated transition:
        1. Validate the transition is allowed
        2. Update workflow_instances.current_state
        3. Insert a workflow_transitions record (immutable audit)
        4. Emit an audit event to platform_audit_log
        Returns: (True, "ok") or (False, reason)
        """
        # Step 1 — Validate
        ok, msg = self.can_transition(from_state, to_state)
        if not ok:
            return False, msg

        try:
            now = _now()

            # Step 2 — Update instance current state
            db.execute(text("""
                UPDATE workflow_instances
                SET current_state_key = :to_state, updated_at = :now
                WHERE id = :instance_id
            """), {"to_state": to_state, "now": now, "instance_id": instance_id})

            # Step 3 — Insert transition record (immutable)
            transition_id = str(uuid.uuid4())
            db.execute(text("""
                INSERT INTO workflow_transitions
                (id, hotel_id, instance_id, entity_type, entity_id,
                 from_state, to_state, triggered_by, notes, created_at)
                VALUES
                (:id, :hotel_id, :instance_id, :entity_type, :entity_id,
                 :from_state, :to_state, :triggered_by, :notes, :created_at)
            """), {
                "id":           transition_id,
                "hotel_id":     hotel_id,
                "instance_id":  instance_id,
                "entity_type":  entity_type,
                "entity_id":    entity_id,
                "from_state":   from_state,
                "to_state":     to_state,
                "triggered_by": triggered_by,
                "notes":        notes,
                "created_at":   now,
            })

            db.commit()

            # Step 4 — Emit audit event (never raises)
            try:
                from src.core.audit import audit_action
                audit_action(db, entity_type, entity_id,
                             action=f"WORKFLOW_{to_state.upper()}",
                             hotel_id=hotel_id,
                             actor_id=triggered_by,
                             metadata={"from": from_state, "to": to_state,
                                       "instance_id": instance_id})
            except Exception:
                pass

            logger.info(f"[workflow] {entity_type}/{entity_id}: {from_state} → {to_state}")
            return True, "ok"

        except Exception as e:
            logger.error(f"[workflow] execute_transition failed: {e}")
            try:
                db.rollback()
            except Exception:
                pass
            return False, str(e)

    def create_instance(
        self,
        db: Session,
        definition_id: str,
        entity_type: str,
        entity_id: str,
        initial_state: str,
        hotel_id: Optional[str] = None,
        started_by: Optional[str] = None,
    ) -> Tuple[Optional[str], str]:
        """
        Create a new workflow instance for an entity.
        Returns: (instance_id, "ok") or (None, error_message)
        """
        try:
            instance_id = str(uuid.uuid4())
            now = _now()
            db.execute(text("""
                INSERT INTO workflow_instances
                (id, hotel_id, template_id, entity_type, entity_id,
                 current_state_key, status, created_by, created_at, updated_at)
                VALUES
                (:id, :hotel_id, :template_id, :entity_type, :entity_id,
                 :current_state_key, 'active', :created_by, :created_at, :updated_at)
            """), {
                "id":                instance_id,
                "hotel_id":          hotel_id or "tb-default-hotel-000000000001",
                "template_id":       definition_id,
                "entity_type":       entity_type,
                "entity_id":         entity_id,
                "current_state_key": initial_state,
                "created_by":        started_by,
                "created_at":        now,
                "updated_at":        now,
            })
            db.commit()
            return instance_id, "ok"
        except Exception as e:
            logger.error(f"[workflow] create_instance failed: {e}")
            try:
                db.rollback()
            except Exception:
                pass
            return None, str(e)
