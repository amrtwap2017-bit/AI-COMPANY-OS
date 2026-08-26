"""
SLA Intelligence Engine — Triangle Black A-011
Answers: "Why is SLA compliance 36.4%? What needs to change?"

SCHEMA FACTS (verified):
- work_orders: hotel_id, status, priority, category,
  sla_breached (BOOLEAN), sla_status (TEXT),
  created_at, deleted_at

LIVE DATA:
- 453 WOs total, 356 open, 15 critical
- SLA compliance 36.4% = 63.6% breached

DOES NOT DUPLICATE:
- /api/v1/baseline/report (work_order_backlog section)
- /api/v1/kpi-engine/dashboard (KPI-01)

NEW VALUE:
- Breach analysis by priority and category
- SLA risk score per category
- Breach trend analysis
- Actionable improvement recommendations
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class SLAIntelligenceService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hid = hotel_id

    def _s(self, sql: str, params: dict = None, default=0):
        try:
            val = self.db.execute(text(sql), params or {"hid": self.hid}).scalar()
            return val if val is not None else default
        except Exception:
            return default

    def _q(self, sql: str, params: dict = None):
        try:
            return self.db.execute(text(sql), params or {"hid": self.hid}).fetchall()
        except Exception:
            return []

    def breach_by_priority(self) -> list:
        """SLA breach rate grouped by priority with weighted risk score."""
        rows = self._q("""
            SELECT
                COALESCE(LOWER(priority), 'unknown') AS priority,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE sla_breached = TRUE) AS breached,
                COUNT(*) FILTER (WHERE LOWER(status) = 'open') AS still_open,
                CASE COALESCE(LOWER(priority), 'unknown')
                    WHEN 'critical' THEN 4
                    WHEN 'high' THEN 3
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 1
                    ELSE 1
                END AS weight
            FROM work_orders
            WHERE hotel_id = :hid AND deleted_at IS NULL
            GROUP BY LOWER(priority)
            ORDER BY weight DESC
        """)

        result = []
        for r in rows:
            d = dict(r._mapping)
            total = d.get("total", 0)
            breached = d.get("breached", 0)
            breach_pct = round(breached / max(total, 1) * 100, 1)
            risk_score = round(breach_pct * d.get("weight", 1) / 4, 1)
            result.append({
                **d,
                "breach_pct": breach_pct,
                "compliance_pct": round(100 - breach_pct, 1),
                "risk_score": risk_score,
                "risk_level": (
                    "CRITICAL" if risk_score >= 75
                    else "HIGH" if risk_score >= 50
                    else "MODERATE" if risk_score >= 25
                    else "LOW"
                )
            })
        return result

    def breach_by_category(self) -> list:
        """SLA breach rate grouped by work order category."""
        rows = self._q("""
            SELECT
                COALESCE(LOWER(category), 'uncategorized') AS category,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE sla_breached = TRUE) AS breached,
                COUNT(*) FILTER (WHERE LOWER(status) = 'open') AS open_count,
                COUNT(*) FILTER (WHERE LOWER(priority) IN ('critical','high')
                    AND sla_breached = TRUE) AS critical_high_breached
            FROM work_orders
            WHERE hotel_id = :hid AND deleted_at IS NULL
            GROUP BY LOWER(category)
            ORDER BY breached DESC
        """)

        result = []
        for r in rows:
            d = dict(r._mapping)
            total = d.get("total", 0)
            breached = d.get("breached", 0)
            breach_pct = round(breached / max(total, 1) * 100, 1)
            result.append({
                **d,
                "breach_pct": breach_pct,
                "compliance_pct": round(100 - breach_pct, 1),
                "status": (
                    "CRITICAL" if breach_pct >= 70
                    else "HIGH" if breach_pct >= 50
                    else "MODERATE" if breach_pct >= 30
                    else "ACCEPTABLE"
                )
            })
        return sorted(result, key=lambda x: x["breach_pct"], reverse=True)

    def backlog_analysis(self) -> dict:
        """Work order backlog — age and concentration."""
        total_open = self._s("""
            SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL AND LOWER(status)='open'
        """)
        total_all = self._s(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL")

        age_buckets = self._q("""
            SELECT
                CASE
                    WHEN NOW() - created_at <= INTERVAL '1 day' THEN 'TODAY'
                    WHEN NOW() - created_at <= INTERVAL '7 days' THEN '1_7_DAYS'
                    WHEN NOW() - created_at <= INTERVAL '30 days' THEN '8_30_DAYS'
                    WHEN NOW() - created_at <= INTERVAL '90 days' THEN '31_90_DAYS'
                    ELSE '90_PLUS_DAYS'
                END AS age_bucket,
                COUNT(*) AS count,
                COUNT(*) FILTER (WHERE LOWER(priority) IN ('critical','high')) AS high_priority_count
            FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL AND LOWER(status)='open'
            GROUP BY 1
            ORDER BY
                CASE
                    WHEN NOW() - created_at <= INTERVAL '1 day' THEN 1
                    WHEN NOW() - created_at <= INTERVAL '7 days' THEN 2
                    WHEN NOW() - created_at <= INTERVAL '30 days' THEN 3
                    WHEN NOW() - created_at <= INTERVAL '90 days' THEN 4
                    ELSE 5
                END
        """)

        stale_count = self._s("""
            SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL AND LOWER(status)='open'
              AND created_at < NOW() - INTERVAL '30 days'
        """)

        return {
            "total_open": total_open,
            "total_all": total_all,
            "completion_rate_pct": round((total_all - total_open) / max(total_all, 1) * 100, 1),
            "stale_over_30_days": stale_count,
            "stale_pct": round(stale_count / max(total_open, 1) * 100, 1),
            "age_distribution": [dict(r._mapping) for r in age_buckets],
        }

    def recommendations(self) -> list:
        """Actionable SLA improvement recommendations."""
        by_priority = self.breach_by_priority()
        by_category = self.breach_by_category()
        backlog = self.backlog_analysis()

        recs = []

        # Critical priority breach
        crit = next((p for p in by_priority if p["priority"] == "critical"), None)
        if crit and crit.get("breach_pct", 0) > 50:
            recs.append({
                "priority": "P0",
                "type": "CRITICAL_SLA_BREACH",
                "message": f"Critical work orders have {crit['breach_pct']}% SLA breach — immediate resource deployment required",
                "metric": f"{crit['breached']} critical WOs breached SLA",
                "action": "Assign dedicated technician team to critical open WOs today"
            })

        # Worst category
        if by_category:
            worst = by_category[0]
            if worst.get("breach_pct", 0) > 60:
                recs.append({
                    "priority": "P1",
                    "type": "CATEGORY_SLA_CRISIS",
                    "message": f"Category '{worst['category']}' has {worst['breach_pct']}% SLA breach rate",
                    "metric": f"{worst['breached']} of {worst['total']} WOs breached",
                    "action": f"Review {worst['category']} workflow — consider dedicated resource or contractor"
                })

        # Stale backlog
        if backlog.get("stale_over_30_days", 0) > 20:
            recs.append({
                "priority": "P1",
                "type": "STALE_BACKLOG",
                "message": f"{backlog['stale_over_30_days']} work orders open for 30+ days ({backlog['stale_pct']}% of backlog)",
                "metric": f"Stale WO rate: {backlog['stale_pct']}%",
                "action": "Conduct weekly backlog review — escalate or close stale WOs"
            })

        # Overall compliance
        overall_compliance = self._s("""
            SELECT ROUND(
                (COUNT(*) FILTER (WHERE sla_breached = FALSE OR sla_breached IS NULL))::numeric /
                NULLIF(COUNT(*), 0) * 100, 1
            )
            FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL
        """, default=0)

        if float(overall_compliance) < 50:
            recs.append({
                "priority": "P0",
                "type": "OVERALL_SLA_CRISIS",
                "message": f"Overall SLA compliance {overall_compliance}% — far below 90% target",
                "metric": f"Gap: {round(90 - float(overall_compliance), 1)}% below target",
                "action": "Conduct SLA root cause analysis — review technician capacity, response procedures"
            })

        return recs

    def summary(self) -> dict:
        """Complete SLA intelligence summary."""
        by_priority = self.breach_by_priority()
        by_category = self.breach_by_category()
        backlog = self.backlog_analysis()
        recs = self.recommendations()

        total = self._s(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL")
        breached = self._s("""
            SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL AND sla_breached=TRUE
        """)
        compliance_pct = round((total - breached) / max(total, 1) * 100, 1)

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "overall_compliance_pct": compliance_pct,
            "overall_breach_pct": round(100 - compliance_pct, 1),
            "compliance_grade": (
                "A" if compliance_pct >= 90 else "B" if compliance_pct >= 75
                else "C" if compliance_pct >= 60 else "D"
            ),
            "total_work_orders": total,
            "total_breached": breached,
            "backlog": backlog,
            "by_priority": by_priority,
            "by_category": by_category[:8],
            "recommendations": recs,
            "recommendation_count": len(recs),
        }
