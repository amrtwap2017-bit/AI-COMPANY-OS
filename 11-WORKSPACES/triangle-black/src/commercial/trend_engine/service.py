"""
Month-over-Month Trend Engine — Triangle Black A-070
Answers: "How does THIS month compare to LAST month?"

5 KPIs tracked:
1. WOs completed
2. Avg completion time  
3. SLA compliance rate
4. PM plan compliance
5. Procurement spend

Uses PostgreSQL DATE_TRUNC (NOT MySQL YEAR()/MONTH())
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class TrendEngineService:
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

    def monthly_kpis(self, months: int = 6) -> list:
        """KPI comparison across last N months."""
        rows = self._q("""
            SELECT
                DATE_TRUNC('month', created_at)::DATE AS month,
                COUNT(*) AS total_wos,
                COUNT(*) FILTER (
                    WHERE LOWER(status) IN ('completed','closed')
                ) AS completed_wos,
                ROUND(AVG(
                    CASE WHEN completed_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600.0
                    END
                ), 1) AS avg_completion_hours,
                COUNT(*) FILTER (
                    WHERE LOWER(status) IN ('completed','closed')
                    AND (sla_breached IS NULL OR sla_breached = FALSE)
                ) AS sla_compliant
            FROM work_orders
            WHERE hotel_id = :h
              AND deleted_at IS NULL
              AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month DESC
            LIMIT :months
        """, {"h": self.hid, "months": months})

        result = []
        for r in rows:
            d = dict(r._mapping)
            total = d.get("total_wos", 0) or 0
            completed = d.get("completed_wos", 0) or 0
            sla_ok = d.get("sla_compliant", 0) or 0

            result.append({
                "month": str(d.get("month", "")),
                "total_wos": total,
                "completed_wos": completed,
                "completion_rate_pct": round(completed / max(total, 1) * 100, 1),
                "avg_completion_hours": float(d.get("avg_completion_hours") or 0),
                "sla_compliance_pct": round(sla_ok / max(completed, 1) * 100, 1),
            })

        return result

    def pm_trend(self, months: int = 6) -> list:
        """PM compliance trend month over month."""
        rows = self._q("""
            SELECT
                DATE_TRUNC('month', created_at)::DATE AS month,
                COUNT(*) AS total_plans,
                COUNT(*) FILTER (
                    WHERE next_due_date IS NULL
                    OR next_due_date::DATE >= CURRENT_DATE
                ) AS on_schedule
            FROM maintenance_plans
            WHERE hotel_id = :h
              AND LOWER(status) = 'active'
              AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month DESC
            LIMIT :months
        """, {"h": self.hid, "months": months})

        return [{
            "month": str(r._mapping["month"]),
            "total_plans": r._mapping["total_plans"],
            "on_schedule": r._mapping["on_schedule"],
            "compliance_pct": round(
                r._mapping["on_schedule"] / max(r._mapping["total_plans"], 1) * 100, 1
            )
        } for r in rows]

    def spend_trend(self, months: int = 6) -> list:
        """Procurement spend month over month."""
        rows = self._q("""
            SELECT
                DATE_TRUNC('month', created_at)::DATE AS month,
                COUNT(*) AS po_count,
                COALESCE(SUM(subtotal), 0) AS total_spend,
                COALESCE(AVG(subtotal), 0) AS avg_po_value
            FROM purchase_orders
            WHERE hotel_id = :h
              AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month DESC
            LIMIT :months
        """, {"h": self.hid, "months": months})

        return [{
            "month": str(r._mapping["month"]),
            "po_count": r._mapping["po_count"],
            "total_spend": float(r._mapping["total_spend"] or 0),
            "avg_po_value": float(r._mapping["avg_po_value"] or 0),
        } for r in rows]

    def compare_months(self) -> dict:
        """Compare current month vs previous month."""
        monthly = self.monthly_kpis(months=2)

        if len(monthly) < 2:
            return {
                "hotel_id": self.hid,
                "message": "Not enough historical data for comparison",
                "current_month": monthly[0] if monthly else {},
                "previous_month": {},
                "trends": {},
            }

        current = monthly[0]
        previous = monthly[1]

        def pct_change(curr, prev):
            if not prev: return 0
            return round((curr - prev) / max(abs(prev), 1) * 100, 1)

        trends = {
            "wos_completed": {
                "current": current["completed_wos"],
                "previous": previous["completed_wos"],
                "change_pct": pct_change(current["completed_wos"], previous["completed_wos"]),
                "direction": "UP" if current["completed_wos"] > previous["completed_wos"] else "DOWN",
            },
            "completion_rate": {
                "current": current["completion_rate_pct"],
                "previous": previous["completion_rate_pct"],
                "change_pct": pct_change(current["completion_rate_pct"], previous["completion_rate_pct"]),
                "direction": "UP" if current["completion_rate_pct"] > previous["completion_rate_pct"] else "DOWN",
            },
            "sla_compliance": {
                "current": current["sla_compliance_pct"],
                "previous": previous["sla_compliance_pct"],
                "change_pct": pct_change(current["sla_compliance_pct"], previous["sla_compliance_pct"]),
                "direction": "UP" if current["sla_compliance_pct"] > previous["sla_compliance_pct"] else "DOWN",
            },
            "avg_completion_hours": {
                "current": current["avg_completion_hours"],
                "previous": previous["avg_completion_hours"],
                "change_pct": pct_change(current["avg_completion_hours"], previous["avg_completion_hours"]),
                "direction": "DOWN" if current["avg_completion_hours"] < previous["avg_completion_hours"] else "UP",
                "is_improvement": current["avg_completion_hours"] < previous["avg_completion_hours"],
            },
        }

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "current_month": current,
            "previous_month": previous,
            "trends": trends,
        }

    def summary(self) -> dict:
        monthly = self.monthly_kpis(months=6)
        pm = self.pm_trend(months=3)
        spend = self.spend_trend(months=3)
        comparison = self.compare_months()

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "monthly_wo_trend": monthly,
            "pm_compliance_trend": pm,
            "spend_trend": spend,
            "month_comparison": comparison,
        }
