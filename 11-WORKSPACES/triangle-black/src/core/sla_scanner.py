"""
SLA Breach Scanner — T-019
Detects work orders that have breached SLA and emits WO_SLA_BREACHED events
to the platform_events outbox.

Architecture:
  Periodic scan OR triggered scan
  → Find WOs where sla_breach_at < NOW() AND sla_breached = FALSE
  → Update sla_breached = TRUE, sla_status = 'breached'
  → Emit WO_SLA_BREACHED event to platform_events
  → Non-blocking — never fails the caller

Called from:
  - GET /api/v1/work-orders/sla-breached (auto-scan before response)
  - POST /api/v1/platform/sla-scan (manual trigger)
"""
from __future__ import annotations
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.events import emit_event, EventType


def scan_and_emit_sla_breaches(
    db: Session,
    hotel_id: str,
    actor: str = "sla_scanner",
    limit: int = 100,
) -> Dict[str, Any]:
    """
    Scan for newly breached SLA work orders and emit events.
    Returns summary of scan results.
    Never raises — failures are logged in result.
    """
    result = {
        "hotel_id": hotel_id,
        "scanned_at": str(datetime.utcnow()),
        "newly_breached": 0,
        "events_emitted": 0,
        "errors": [],
    }

    try:
        # Find WOs that have breached but not yet been marked
        rows = db.execute(text("""
            SELECT id, title, priority, sla_hours, sla_breach_at, hotel_id
            FROM work_orders
            WHERE hotel_id = :hid
              AND deleted_at IS NULL
              AND status NOT IN ('completed', 'closed')
              AND sla_breach_at IS NOT NULL
              AND sla_breach_at < NOW()
              AND (sla_breached = FALSE OR sla_breached IS NULL)
            LIMIT :lim
        """), {"hid": hotel_id, "lim": limit}).fetchall()

        newly_breached = [dict(r._mapping) for r in rows]
        result["newly_breached"] = len(newly_breached)

        for wo in newly_breached:
            wo_id = wo["id"]
            try:
                # Mark as breached
                db.execute(text("""
                    UPDATE work_orders
                    SET sla_breached = TRUE,
                        sla_status = 'breached',
                        updated_at = NOW()
                    WHERE id = :id AND hotel_id = :hid
                """), {"id": wo_id, "hid": hotel_id})
                db.commit()

                # Emit event to outbox
                event_id = emit_event(
                    db=db,
                    hotel_id=hotel_id,
                    event_type=EventType.WO_SLA_BREACHED,
                    aggregate_type="work_order",
                    aggregate_id=wo_id,
                    payload={
                        "title": wo.get("title"),
                        "priority": wo.get("priority"),
                        "sla_hours": wo.get("sla_hours"),
                        "sla_breach_at": str(wo.get("sla_breach_at")),
                        "breached_at": str(datetime.utcnow()),
                    },
                    actor=actor,
                )
                if event_id:
                    result["events_emitted"] += 1

            except Exception as e:
                result["errors"].append(f"WO {wo_id}: {str(e)[:80]}")
                try:
                    db.rollback()
                except Exception:
                    pass

    except Exception as e:
        result["errors"].append(f"scan_error: {str(e)[:100]}")

    return result


def get_breach_summary(db: Session, hotel_id: str) -> Dict[str, Any]:
    """
    Quick summary of SLA breach state for this hotel.
    Used by platform status endpoint.
    """
    try:
        row = db.execute(text("""
            SELECT
                COUNT(*) AS total_open,
                SUM(CASE WHEN sla_breached = TRUE THEN 1 ELSE 0 END) AS currently_breached,
                SUM(CASE WHEN sla_breach_at < NOW()
                          AND status NOT IN ('completed','closed')
                          AND (sla_breached = FALSE OR sla_breached IS NULL)
                     THEN 1 ELSE 0 END) AS undetected_breaches
            FROM work_orders
            WHERE hotel_id = :hid AND deleted_at IS NULL
        """), {"hid": hotel_id}).fetchone()
        d = dict(row._mapping) if row else {}
        return {
            "hotel_id": hotel_id,
            "total_open": int(d.get("total_open") or 0),
            "currently_breached": int(d.get("currently_breached") or 0),
            "undetected_breaches": int(d.get("undetected_breaches") or 0),
        }
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)}
