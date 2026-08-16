"""
Triangle Black — Audit Helper (Sprint-216)
Thin wrapper around record_audit_event for easy injection into routers.

Usage:
    from src.core.audit import audit_create, audit_update, audit_action

    audit_create(db, "work_order", wo_id, hotel_id, actor="system")
    audit_update(db, "lead", lead_id, hotel_id, old={"status":"new"}, new={"status":"qualified"})
    audit_action(db, "contract", contract_id, hotel_id, "ACTIVATED", actor_id="user-001")
"""
from __future__ import annotations
import json
import logging
from typing import Optional, Any
from sqlalchemy.orm import Session

logger = logging.getLogger("tb.audit")


def _safe_json(obj: Any) -> Optional[str]:
    if obj is None:
        return None
    if isinstance(obj, str):
        return obj
    try:
        return json.dumps(obj, default=str)
    except Exception:
        return str(obj)


def audit_create(
    db: Session,
    entity_type: str,
    entity_id: str,
    hotel_id: Optional[str] = None,
    actor_id: Optional[str] = None,
    actor_name: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> None:
    """Record a CREATE audit event. Never raises."""
    try:
        from src.commercial.audit_log.repository import record_audit_event
        record_audit_event(
            db=db,
            entity_type=entity_type,
            action="CREATE",
            hotel_id=hotel_id,
            entity_id=entity_id,
            actor_id=actor_id,
            actor_name=actor_name,
            new_value=_safe_json(metadata),
        )
    except Exception as e:
        logger.warning(f"[audit] Failed to record CREATE for {entity_type}/{entity_id}: {e}")


def audit_update(
    db: Session,
    entity_type: str,
    entity_id: str,
    hotel_id: Optional[str] = None,
    actor_id: Optional[str] = None,
    actor_name: Optional[str] = None,
    old_value: Any = None,
    new_value: Any = None,
) -> None:
    """Record an UPDATE audit event. Never raises."""
    try:
        from src.commercial.audit_log.repository import record_audit_event
        record_audit_event(
            db=db,
            entity_type=entity_type,
            action="UPDATE",
            hotel_id=hotel_id,
            entity_id=entity_id,
            actor_id=actor_id,
            actor_name=actor_name,
            old_value=_safe_json(old_value),
            new_value=_safe_json(new_value),
        )
    except Exception as e:
        logger.warning(f"[audit] Failed to record UPDATE for {entity_type}/{entity_id}: {e}")


def audit_action(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    hotel_id: Optional[str] = None,
    actor_id: Optional[str] = None,
    actor_name: Optional[str] = None,
    metadata: Any = None,
) -> None:
    """Record a named action audit event (ACTIVATE, APPROVE, CANCEL etc). Never raises."""
    try:
        from src.commercial.audit_log.repository import record_audit_event
        record_audit_event(
            db=db,
            entity_type=entity_type,
            action=action.upper(),
            hotel_id=hotel_id,
            entity_id=entity_id,
            actor_id=actor_id,
            actor_name=actor_name,
            new_value=_safe_json(metadata),
        )
    except Exception as e:
        logger.warning(f"[audit] Failed to record {action} for {entity_type}/{entity_id}: {e}")


def audit_delete(
    db: Session,
    entity_type: str,
    entity_id: str,
    hotel_id: Optional[str] = None,
    actor_id: Optional[str] = None,
    old_value: Any = None,
) -> None:
    """Record a DELETE audit event. Never raises."""
    try:
        from src.commercial.audit_log.repository import record_audit_event
        record_audit_event(
            db=db,
            entity_type=entity_type,
            action="DELETE",
            hotel_id=hotel_id,
            entity_id=entity_id,
            actor_id=actor_id,
            old_value=_safe_json(old_value),
        )
    except Exception as e:
        logger.warning(f"[audit] Failed to record DELETE for {entity_type}/{entity_id}: {e}")
