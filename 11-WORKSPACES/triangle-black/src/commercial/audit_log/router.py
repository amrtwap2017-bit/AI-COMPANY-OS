from __future__ import annotations
import uuid, datetime
from datetime import datetime as _dt
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/audit-log", tags=["audit-log"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _ensure_audit_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS platform_audit_log (
            id            VARCHAR(36) PRIMARY KEY,
            entity_type   VARCHAR(50) NOT NULL,
            entity_id     VARCHAR(36),
            action        VARCHAR(100) NOT NULL,
            actor_id      VARCHAR(100),
            actor_name    VARCHAR(200),
            old_value     TEXT,
            new_value     TEXT,
            ip_address    VARCHAR(45),
            hotel_id      VARCHAR(36),
            metadata      TEXT,
            created_at    TIMESTAMP NOT NULL
        )
    """))
    db.commit()

@router.post("/record", summary="Record an audit event")
def record_audit(data: dict, db: Session = Depends(get_db)):
    """
    Record an auditable action in the platform audit log.
    Called internally when critical operations occur.
    Body: { entity_type, entity_id, action, actor_id, actor_name,
            old_value, new_value, hotel_id, metadata }
    """
    _ensure_audit_table(db)
    now = _dt.utcnow()
    audit_id = str(uuid.uuid4())

    db.execute(text("""
        INSERT INTO platform_audit_log
            (id, entity_type, entity_id, action, actor_id, actor_name,
             old_value, new_value, hotel_id, metadata, created_at)
        VALUES
            (:id, :entity_type, :entity_id, :action, :actor_id, :actor_name,
             :old_value, :new_value, :hotel_id, :metadata, :now)
    """), {
        "id":          audit_id,
        "entity_type": data.get("entity_type", "unknown"),
        "entity_id":   data.get("entity_id"),
        "action":      data.get("action", "unknown"),
        "actor_id":    data.get("actor_id", "system"),
        "actor_name":  data.get("actor_name", "System"),
        "old_value":   str(data.get("old_value", ""))[:500] if data.get("old_value") else None,
        "new_value":   str(data.get("new_value", ""))[:500] if data.get("new_value") else None,
        "hotel_id":    data.get("hotel_id"),
        "metadata":    str(data.get("metadata", ""))[:1000] if data.get("metadata") else None,
        "now":         now,
    })
    db.commit()

    return {
        "success":    True,
        "audit_id":   audit_id,
        "recorded_at": now.isoformat(),
    }

@router.get("/entity/{entity_type}/{entity_id}", summary="Audit trail for entity")
def get_entity_audit(
    entity_type: str,
    entity_id: str,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db)
):
    """Returns complete audit trail for a specific entity."""
    _ensure_audit_table(db)
    try:
        rows = db.execute(text("""
            SELECT * FROM platform_audit_log
            WHERE entity_type = :etype AND entity_id = :eid
            ORDER BY created_at DESC
            LIMIT :limit
        """), {"etype": entity_type, "eid": entity_id, "limit": limit}).fetchall()
        return {
            "entity_type": entity_type,
            "entity_id":   entity_id,
            "events":      [row_to_dict(r) for r in rows],
            "total":       len(rows),
        }
    except Exception as e:
        return {"entity_type": entity_type, "entity_id": entity_id, "events": [], "error": str(e)}

@router.get("/recent", summary="Recent platform audit events")
def get_recent_audit(
    limit:       int = Query(default=50, le=200),
    entity_type: str = Query(default=None),
    hotel_id:    str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Returns recent audit events across the platform."""
    _ensure_audit_table(db)
    try:
        where = "WHERE 1=1"
        params = {"limit": limit}
        if entity_type:
            where += " AND entity_type = :etype"
            params["etype"] = entity_type
        if hotel_id:
            where += " AND hotel_id = :hotel_id"
            params["hotel_id"] = hotel_id

        rows = db.execute(text(f"""
            SELECT * FROM platform_audit_log
            {where}
            ORDER BY created_at DESC
            LIMIT :limit
        """), params).fetchall()

        return {
            "events":     [row_to_dict(r) for r in rows],
            "total":      len(rows),
            "generated_at": _dt.utcnow().isoformat(),
        }
    except Exception as e:
        return {"events": [], "total": 0, "error": str(e)}

@router.get("/summary", summary="Audit log summary stats")
def audit_summary(db: Session = Depends(get_db)):
    """Summary of recent audit activity."""
    _ensure_audit_table(db)
    try:
        row = db.execute(text("""
            SELECT
                count(*) as total_events,
                count(DISTINCT entity_type) as entity_types,
                count(DISTINCT actor_id) as unique_actors,
                max(created_at) as last_event
            FROM platform_audit_log
            WHERE created_at >= NOW() - INTERVAL '7 days'
        """)).fetchone()
        d = row_to_dict(row)

        by_type = db.execute(text("""
            SELECT entity_type, count(*) as count
            FROM platform_audit_log
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY entity_type
            ORDER BY count(*) DESC
            LIMIT 10
        """)).fetchall()

        return {
            "last_7_days":    d,
            "by_entity_type": [row_to_dict(r) for r in by_type],
            "generated_at":   _dt.utcnow().isoformat(),
        }
    except Exception as e:
        return {"last_7_days": {}, "by_entity_type": [], "error": str(e)}
