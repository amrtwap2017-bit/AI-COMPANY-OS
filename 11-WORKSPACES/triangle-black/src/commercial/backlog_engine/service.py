"""
WO Backlog Intelligence Engine — Triangle Black A-035
NEW: Work order backlog age + priority analysis

Answers: "How long have we been sitting on open work orders?"

NEW:
  /api/v1/backlog-engine/summary      — backlog overview
  /api/v1/backlog-engine/by-priority  — age distribution by priority
  /api/v1/backlog-engine/oldest       — oldest open WOs ranked

DB: work_orders.created_at, status, priority, hotel_id, title, asset_id
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

# SLA targets in hours (for age risk classification)
SLA_HOURS = {
    "emergency": 2,
    "critical":  4,
    "high":      8,
    "medium":    24,
    "low":       72,
}


class BacklogEngineService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hid = hotel_id

    def _q(self, sql, params=None):
        try:
            return self.db.execute(text(sql), params or {"h": self.hid}).fetchall()
        except Exception:
            try: self.db.rollback()
            except: pass
            return []

    def _scalar(self, sql, params=None, default=0):
        try:
            val = self.db.execute(text(sql), params or {"h": self.hid}).scalar()
            return val if val is not None else default
        except Exception:
            try: self.db.rollback()
            except: pass
            return default

    def by_priority(self) -> list:
        """WO backlog age grouped by priority."""
        rows = self._q("""
            SELECT
                priority,
                COUNT(*) AS count,
                ROUND(AVG(
                    EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600
                ), 1) AS avg_age_hours,
                ROUND(MAX(
                    EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600
                ), 1) AS max_age_hours,
                ROUND(AVG(
                    EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400
                ), 1) AS avg_age_days,
                ROUND(MAX(
                    EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400
                ), 0) AS max_age_days
            FROM work_orders
            WHERE hotel_id = :h
              AND deleted_at IS NULL
              AND LOWER(status) IN ('open', 'in_progress')
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
            priority = d.get("priority", "medium") or "medium"
            target_hrs = SLA_HOURS.get(priority, 24)
            avg_hrs = float(d.get("avg_age_hours") or 0)
            max_hrs = float(d.get("max_age_hours") or 0)

            # Risk: how much over SLA target is the average age?
            avg_overrun = round(avg_hrs / target_hrs, 1) if target_hrs > 0 else 0
            risk = (
                "CRITICAL" if avg_overrun >= 5
                else "HIGH" if avg_overrun >= 2
                else "MODERATE" if avg_overrun >= 1
                else "LOW"
            )

            result.append({
                "priority": priority,
                "count": d.get("count", 0),
                "avg_age_hours": avg_hrs,
                "max_age_hours": max_hrs,
                "avg_age_days": float(d.get("avg_age_days") or 0),
                "max_age_days": int(d.get("max_age_days") or 0),
                "sla_target_hours": target_hrs,
                "avg_sla_overrun_x": avg_overrun,
                "risk_level": risk,
            })

        return result

    def oldest(self, limit: int = 20) -> list:
        """Oldest open work orders ranked by age."""
        rows = self._q("""
            SELECT
                wo.id, wo.title, wo.priority, wo.status,
                wo.created_at,
                ROUND(
                    EXTRACT(EPOCH FROM (NOW() - wo.created_at)) / 86400, 1
                ) AS age_days,
                ROUND(
                    EXTRACT(EPOCH FROM (NOW() - wo.created_at)) / 3600, 1
                ) AS age_hours,
                a.name AS asset_name,
                a.category AS asset_category
            FROM work_orders wo
            LEFT JOIN assets a ON a.id = wo.asset_id AND a.hotel_id = :h
            WHERE wo.hotel_id = :h
              AND wo.deleted_at IS NULL
              AND LOWER(wo.status) IN ('open', 'in_progress')
            ORDER BY wo.created_at ASC
            LIMIT :lim
        """, {"h": self.hid, "lim": limit})

        result = []
        for r in rows:
            d = dict(r._mapping)
            priority = d.get("priority", "medium") or "medium"
            target_hrs = SLA_HOURS.get(priority, 24)
            age_hrs = float(d.get("age_hours") or 0)
            overrun = round(age_hrs / target_hrs, 1) if target_hrs > 0 else 0
            result.append({
                "id": d["id"],
                "title": d.get("title", ""),
                "priority": priority,
                "status": d.get("status", ""),
                "age_days": float(d.get("age_days") or 0),
                "age_hours": age_hrs,
                "sla_target_hours": target_hrs,
                "sla_overrun_x": overrun,
                "asset_name": d.get("asset_name", ""),
                "asset_category": d.get("asset_category", ""),
                "urgency": (
                    "CRITICAL" if overrun >= 5
                    else "HIGH" if overrun >= 2
                    else "OVERDUE" if overrun >= 1
                    else "PENDING"
                ),
            })
        return result

    def summary(self) -> dict:
        """Overall backlog intelligence summary."""
        by_p = self.by_priority()
        oldest = self.oldest(limit=100)

        total_open = sum(p["count"] for p in by_p)
        critical_overrun = [p for p in by_p if p["risk_level"] in ("CRITICAL","HIGH")]
        most_overdue = [o for o in oldest if o["urgency"] in ("CRITICAL","HIGH")]

        avg_age_all = self._scalar("""
            SELECT ROUND(AVG(
                EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400
            ), 1)
            FROM work_orders
            WHERE hotel_id = :h AND deleted_at IS NULL
            AND LOWER(status) IN ('open','in_progress')
        """)

        oldest_age = self._scalar("""
            SELECT ROUND(MAX(
                EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400
            ), 0)
            FROM work_orders
            WHERE hotel_id = :h AND deleted_at IS NULL
            AND LOWER(status) IN ('open','in_progress')
        """)

        insights = []
        if float(oldest_age or 0) > 30:
            insights.append({
                "type": "VERY_OLD_WOS",
                "severity": "CRITICAL",
                "message": f"Some open work orders are over {int(oldest_age)} days old"
            })
        if critical_overrun:
            insights.append({
                "type": "PRIORITY_BACKLOG",
                "severity": "HIGH",
                "message": f"{sum(p['count'] for p in critical_overrun)} high-priority WOs are significantly overdue their SLA target"
            })
        if total_open > 200:
            insights.append({
                "type": "LARGE_BACKLOG",
                "severity": "MEDIUM",
                "message": f"WO backlog of {total_open} open items requires capacity planning"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "backlog_summary": {
                "total_open": total_open,
                "avg_age_days": float(avg_age_all or 0),
                "max_age_days": int(oldest_age or 0),
                "critical_overrun_count": sum(p["count"] for p in critical_overrun),
            },
            "by_priority": by_p,
            "oldest_5": oldest[:5],
            "insights": insights,
        }
