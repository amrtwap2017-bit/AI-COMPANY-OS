"""
P1-D: Business Telemetry — Track important business events
Separate from technical metrics — this tracks OPERATIONAL intelligence.
"""
from __future__ import annotations
import logging
from datetime import datetime
from typing import Optional, Dict, Any

logger = logging.getLogger("triangle_black.telemetry")


def log_business_event(
    event_type: str,
    hotel_id: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    actor: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
):
    """
    Log a structured business event.
    These feed into observability dashboards and alerting.

    Event types:
      wo.created, wo.completed, wo.critical_opened
      pm.overdue, pm.completed
      rec.generated, rec.approved, rec.rejected, rec.outcome_recorded
      import.started, import.completed, import.failed
      pilot.baseline_captured
      attention.p0_detected
    """
    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "hotel_id": hotel_id,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "actor": actor,
        "details": details or {},
    }
    logger.info(
        f"[BUSINESS_EVENT] {event_type}",
        extra={"business_event": event}
    )
    return event


def alert_p0(
    hotel_id: str,
    alert_type: str,
    message: str,
    count: Optional[int] = None,
):
    """
    P0 alert — something requires immediate attention.
    In production, this should trigger: email + webhook + dashboard notification.
    """
    logger.warning(
        f"[P0_ALERT] {alert_type}: {message}",
        extra={
            "alert_type": alert_type,
            "hotel_id": hotel_id,
            "count": count,
            "timestamp": datetime.utcnow().isoformat(),
            "severity": "P0",
        }
    )


class BusinessMetrics:
    """
    Calculate and expose key business metrics for observability.
    Used by health/metrics endpoint and future Grafana integration.
    """

    @staticmethod
    def get_operational_metrics(db, hotel_id: str) -> Dict[str, Any]:
        """
        Live operational metrics for observability dashboard.
        Returns metrics that matter commercially — not just technical.
        """
        from sqlalchemy import text
        h = hotel_id
        metrics = {}

        try:
            # Work Order health
            metrics["wo_total"] = db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h"
            ), {"h": h}).scalar() or 0

            metrics["wo_critical_open"] = db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h "
                "AND priority='critical' AND status NOT IN ('completed','cancelled')"
            ), {"h": h}).scalar() or 0

            metrics["wo_unassigned"] = db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h "
                "AND status='open' AND technician_id IS NULL"
            ), {"h": h}).scalar() or 0

            # PM health
            metrics["pm_overdue"] = db.execute(text(
                "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h "
                "AND status='active' AND next_due_date < CURRENT_DATE"
            ), {"h": h}).scalar() or 0

            metrics["pm_active"] = db.execute(text(
                "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND status='active'"
            ), {"h": h}).scalar() or 0

            # AI health
            metrics["recs_pending"] = db.execute(text(
                "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='pending'"
            ), {"h": h}).scalar() or 0

            metrics["recs_with_outcome"] = db.execute(text(
                "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND outcome IS NOT NULL"
            ), {"h": h}).scalar() or 0

            # Data quality
            wo_linked = db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NOT NULL"
            ), {"h": h}).scalar() or 0
            metrics["wo_asset_linkage_pct"] = round(
                wo_linked / max(metrics["wo_total"], 1) * 100, 1
            )

            # Alerts
            alerts = []
            if metrics["wo_critical_open"] > 50:
                alerts.append({"level": "P0", "type": "critical_wo_backlog",
                               "message": f"{metrics['wo_critical_open']} critical WOs open"})
            if metrics["pm_overdue"] > 100:
                alerts.append({"level": "P1", "type": "pm_overdue_spike",
                               "message": f"{metrics['pm_overdue']} PM plans overdue"})
            if metrics["wo_asset_linkage_pct"] < 10:
                alerts.append({"level": "P1", "type": "data_quality_low",
                               "message": f"WO→Asset linkage {metrics['wo_asset_linkage_pct']}%"})

            metrics["alerts"] = alerts
            metrics["alert_count"] = len(alerts)
            metrics["p0_alert_count"] = sum(1 for a in alerts if a["level"] == "P0")

        except Exception as e:
            metrics["error"] = str(e)[:100]

        return metrics
