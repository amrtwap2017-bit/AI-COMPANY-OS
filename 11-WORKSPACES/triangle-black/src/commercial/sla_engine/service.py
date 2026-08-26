"""
SLA Engine 2.0 — Triangle Black A-013
NEW: Per-priority compliance, weekly trend, risk forecast
Does NOT duplicate: /api/v1/sla-intelligence/* (existing 4 endpoints)

ADDS:
  /api/v1/sla-engine/summary       — executive SLA overview
  /api/v1/sla-engine/by-priority   — compliance rate per priority
  /api/v1/sla-engine/trend         — weekly breach trend (8 weeks)
  /api/v1/sla-engine/at-risk       — open WOs at risk of breaching

DB facts (verified):
  work_orders: id, hotel_id, title, status, priority, sla_breached (BOOLEAN),
               created_at, updated_at, completed_at, deleted_at
  status: open, in_progress, completed, closed, cancelled
  priority: low, medium, high, critical, emergency
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

# SLA targets in hours by priority
SLA_TARGETS = {
    "emergency": 2,
    "critical":  4,
    "high":      8,
    "medium":    24,
    "low":       72,
}


class SLAEngineService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hid = hotel_id

    def _q(self, sql: str, params: dict = None):
        try:
            return self.db.execute(text(sql), params or {"hid": self.hid}).fetchall()
        except Exception:
            return []

    def _scalar(self, sql: str, params: dict = None, default=0):
        try:
            val = self.db.execute(text(sql), params or {"hid": self.hid}).scalar()
            return val if val is not None else default
        except Exception:
            return default

    def by_priority(self) -> list:
        """Compliance rate per priority using completed/closed WOs."""
        rows = self._q("""
            SELECT
                priority,
                COUNT(*) AS total_count,
                SUM(CASE WHEN sla_breached = TRUE THEN 1 ELSE 0 END) AS breached_count,
                ROUND(
                    (COUNT(*) - SUM(CASE WHEN sla_breached = TRUE THEN 1 ELSE 0 END))
                    * 100.0 / NULLIF(COUNT(*), 0), 1
                ) AS compliance_pct,
                ROUND(
                    AVG(
                        CASE WHEN completed_at IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600.0
                        END
                    ), 1
                ) AS avg_hours_to_complete
            FROM work_orders
            WHERE hotel_id = :hid
              AND deleted_at IS NULL
              AND LOWER(status) IN ('completed', 'closed')
            GROUP BY priority
            ORDER BY
                CASE priority
                    WHEN 'emergency' THEN 1
                    WHEN 'critical'  THEN 2
                    WHEN 'high'      THEN 3
                    WHEN 'medium'    THEN 4
                    WHEN 'low'       THEN 5
                    ELSE 6
                END
        """)

        result = []
        for r in rows:
            d = dict(r._mapping)
            priority = d.get("priority", "medium")
            target_hrs = SLA_TARGETS.get(priority, 24)
            avg_hrs = float(d.get("avg_hours_to_complete") or 0)
            compliance = float(d.get("compliance_pct") or 0)

            result.append({
                "priority": priority,
                "total_count": d.get("total_count", 0),
                "breached_count": d.get("breached_count", 0),
                "compliance_pct": compliance,
                "avg_hours_to_complete": avg_hrs,
                "sla_target_hours": target_hrs,
                "performance": (
                    "EXCELLENT" if compliance >= 95
                    else "GOOD" if compliance >= 85
                    else "ACCEPTABLE" if compliance >= 70
                    else "POOR"
                ),
                "within_target": avg_hrs <= target_hrs if avg_hrs > 0 else True,
            })

        return result

    def weekly_trend(self, weeks: int = 8) -> list:
        """Weekly SLA breach trend for last N weeks."""
        rows = self._q("""
            SELECT
                DATE_TRUNC('week', created_at)::DATE AS week_start,
                COUNT(*) AS total_count,
                SUM(CASE WHEN sla_breached = TRUE THEN 1 ELSE 0 END) AS breach_count,
                ROUND(
                    SUM(CASE WHEN sla_breached = TRUE THEN 1 ELSE 0 END)
                    * 100.0 / NULLIF(COUNT(*), 0), 1
                ) AS breach_rate_pct
            FROM work_orders
            WHERE hotel_id = :hid
              AND deleted_at IS NULL
              AND LOWER(status) IN ('completed', 'closed')
              AND created_at >= NOW() - INTERVAL '8 weeks'
            GROUP BY week_start
            ORDER BY week_start DESC
            LIMIT :weeks
        """, {"hid": self.hid, "weeks": weeks})

        return [dict(r._mapping) for r in rows]

    def at_risk(self) -> list:
        """Open/in-progress WOs that may breach SLA based on age vs target."""
        rows = self._q("""
            SELECT
                id, title, priority, status, created_at,
                ROUND(
                    EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600.0, 1
                ) AS age_hours
            FROM work_orders
            WHERE hotel_id = :hid
              AND deleted_at IS NULL
              AND LOWER(status) IN ('open', 'in_progress')
            ORDER BY created_at ASC
            LIMIT 50
        """)

        result = []
        for r in rows:
            d = dict(r._mapping)
            priority = d.get("priority", "medium")
            target_hrs = SLA_TARGETS.get(priority, 24)
            age_hrs = float(d.get("age_hours") or 0)
            pct_consumed = round(age_hrs / target_hrs * 100, 1) if target_hrs > 0 else 0

            risk = (
                "BREACHED" if age_hrs > target_hrs
                else "CRITICAL" if pct_consumed >= 80
                else "AT_RISK" if pct_consumed >= 60
                else "ON_TRACK"
            )

            result.append({
                "id": d["id"],
                "title": d.get("title", ""),
                "priority": priority,
                "status": d.get("status", ""),
                "age_hours": age_hrs,
                "sla_target_hours": target_hrs,
                "pct_consumed": pct_consumed,
                "risk_level": risk,
            })

        # Sort by risk severity
        risk_order = {"BREACHED": 0, "CRITICAL": 1, "AT_RISK": 2, "ON_TRACK": 3}
        return sorted(result, key=lambda x: risk_order.get(x["risk_level"], 9))

    def summary(self) -> dict:
        """Executive SLA summary."""
        by_p = self.by_priority()
        at_risk = self.at_risk()
        trend = self.weekly_trend()

        total_assessed = sum(p["total_count"] for p in by_p)
        total_breached = sum(p["breached_count"] for p in by_p)
        overall_compliance = round(
            (total_assessed - total_breached) / max(total_assessed, 1) * 100, 1
        )

        breached_open = sum(1 for r in at_risk if r["risk_level"] == "BREACHED")
        critical_risk = sum(1 for r in at_risk if r["risk_level"] in ("BREACHED", "CRITICAL"))

        grade = (
            "A+" if overall_compliance >= 95
            else "A" if overall_compliance >= 90
            else "B+" if overall_compliance >= 80
            else "B" if overall_compliance >= 70
            else "C" if overall_compliance >= 60
            else "D"
        )

        insights = []
        if breached_open > 0:
            insights.append({
                "type": "ACTIVE_BREACHES",
                "severity": "CRITICAL",
                "message": f"{breached_open} open work orders have already breached SLA"
            })
        if overall_compliance < 70:
            insights.append({
                "type": "LOW_COMPLIANCE",
                "severity": "HIGH",
                "message": f"Overall SLA compliance {overall_compliance}% is below 70% threshold"
            })
        if critical_risk > 5:
            insights.append({
                "type": "HIGH_RISK_BACKLOG",
                "severity": "HIGH",
                "message": f"{critical_risk} open work orders are at critical SLA risk"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "overall_compliance_pct": overall_compliance,
            "compliance_grade": grade,
            "total_assessed": total_assessed,
            "total_breached": total_breached,
            "open_at_risk": len(at_risk),
            "open_breached": breached_open,
            "critical_risk_count": critical_risk,
            "by_priority": by_p,
            "weekly_trend": trend[:4],
            "insights": insights,
            "sla_targets": SLA_TARGETS,
        }
