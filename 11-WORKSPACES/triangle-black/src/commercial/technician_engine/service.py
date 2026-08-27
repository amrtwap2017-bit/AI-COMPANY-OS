"""
Technician Productivity Engine — Triangle Black A-069
Answers: "Which technicians are most productive and compliant?"

Uses: work_orders.technician_id + completed_at + created_at + sla_breached
      employees.id + name + department

Does NOT duplicate existing WO endpoints.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class TechnicianEngineService:
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

    def productivity_scores(self, limit: int = 20) -> list:
        """Per-technician productivity score using WO completion data."""
        rows = self._q("""
            SELECT
                wo.technician_id,
                COALESCE(e.name, wo.technician_id) AS technician_name,
                COALESCE(e.department, 'Engineering') AS department,
                COUNT(wo.id) AS total_wos,
                COUNT(wo.id) FILTER (
                    WHERE LOWER(wo.status) IN ('completed','closed')
                ) AS completed_wos,
                COUNT(wo.id) FILTER (
                    WHERE LOWER(wo.status) IN ('completed','closed')
                    AND (wo.sla_breached IS NULL OR wo.sla_breached = FALSE)
                ) AS sla_compliant_wos,
                ROUND(AVG(
                    CASE WHEN wo.completed_at IS NOT NULL AND wo.created_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (wo.completed_at - wo.created_at)) / 3600.0
                    END
                ), 1) AS avg_completion_hours,
                COUNT(wo.id) FILTER (
                    WHERE LOWER(wo.priority) IN ('critical','emergency')
                    AND LOWER(wo.status) IN ('completed','closed')
                ) AS critical_completed
            FROM work_orders wo
            LEFT JOIN employees e ON (
                e.hotel_id = :h AND (
                    e.id::TEXT = wo.technician_id::TEXT OR
                    e.employee_id::TEXT = wo.technician_id::TEXT
                )
            )
            WHERE wo.hotel_id = :h
              AND wo.deleted_at IS NULL
              AND wo.technician_id IS NOT NULL
            GROUP BY wo.technician_id, e.name, e.department
            HAVING COUNT(wo.id) >= 1
            ORDER BY completed_wos DESC
            LIMIT :lim
        """, {"h": self.hid, "lim": limit})

        result = []
        for r in rows:
            d = dict(r._mapping)
            total = d.get("total_wos", 0) or 0
            completed = d.get("completed_wos", 0) or 0
            sla_ok = d.get("sla_compliant_wos", 0) or 0
            avg_hrs = float(d.get("avg_completion_hours") or 0)

            completion_rate = round(completed / max(total, 1) * 100, 1)
            sla_rate = round(sla_ok / max(completed, 1) * 100, 1)

            # Efficiency score 0-100
            # Completion rate 40% + SLA compliance 40% + speed (bonus 20%)
            speed_bonus = max(0, 20 - min(20, avg_hrs / 2)) if avg_hrs > 0 else 10
            efficiency = round(
                completion_rate * 0.40 +
                sla_rate * 0.40 +
                speed_bonus, 1
            )
            efficiency = min(100, max(0, efficiency))

            grade = (
                "EXCELLENT" if efficiency >= 85
                else "GOOD" if efficiency >= 70
                else "ACCEPTABLE" if efficiency >= 55
                else "NEEDS_IMPROVEMENT"
            )

            result.append({
                "technician_id": d.get("technician_id", ""),
                "name": d.get("technician_name", "Unknown"),
                "department": d.get("department", "Engineering"),
                "total_wos": total,
                "completed_wos": completed,
                "sla_compliant_wos": sla_ok,
                "completion_rate_pct": completion_rate,
                "sla_compliance_pct": sla_rate,
                "avg_completion_hours": avg_hrs,
                "critical_completed": d.get("critical_completed", 0),
                "efficiency_score": efficiency,
                "grade": grade,
            })

        return sorted(result, key=lambda x: x["efficiency_score"], reverse=True)

    def summary(self) -> dict:
        """Team productivity summary."""
        scores = self.productivity_scores(limit=100)

        if not scores:
            return {
                "hotel_id": self.hid,
                "generated_at": datetime.utcnow().isoformat(),
                "total_technicians": 0,
                "avg_efficiency_score": 0,
                "grade_distribution": {},
                "top_performers": [],
                "needs_attention": [],
                "insights": [],
            }

        avg_efficiency = round(sum(s["efficiency_score"] for s in scores) / max(len(scores), 1), 1)
        grade_dist = {}
        for s in scores:
            grade_dist[s["grade"]] = grade_dist.get(s["grade"], 0) + 1

        top = [s for s in scores if s["grade"] in ("EXCELLENT", "GOOD")][:3]
        attention = [s for s in scores if s["grade"] == "NEEDS_IMPROVEMENT"][:3]

        insights = []
        if attention:
            insights.append({
                "type": "LOW_PRODUCTIVITY",
                "severity": "HIGH",
                "message": f"{len(attention)} technicians need performance support"
            })
        avg_hrs = round(sum(s["avg_completion_hours"] for s in scores if s["avg_completion_hours"] > 0) /
                        max(sum(1 for s in scores if s["avg_completion_hours"] > 0), 1), 1)
        if avg_hrs > 24:
            insights.append({
                "type": "SLOW_COMPLETION",
                "severity": "MEDIUM",
                "message": f"Average WO completion time is {avg_hrs} hours"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "total_technicians": len(scores),
            "avg_efficiency_score": avg_efficiency,
            "avg_completion_hours": avg_hrs,
            "grade_distribution": grade_dist,
            "top_performers": top,
            "needs_attention": attention,
            "insights": insights,
        }
