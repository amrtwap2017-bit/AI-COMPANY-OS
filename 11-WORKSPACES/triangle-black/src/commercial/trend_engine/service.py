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

    def mttr_by_priority(self) -> dict:
        """
        MTTR (Mean Time To Repair) broken down by priority.
        Only uses records where completed_at > created_at (data quality guard).
        Returns hours per priority level.
        """
        rows = self._q("""
            SELECT
                priority,
                COUNT(*) as total,
                ROUND(AVG(
                    EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600.0
                )::numeric, 1) as avg_hours,
                ROUND(MIN(
                    EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600.0
                )::numeric, 1) as min_hours,
                ROUND(MAX(
                    EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600.0
                )::numeric, 1) as max_hours
            FROM work_orders
            WHERE hotel_id = :h
              AND status = 'completed'
              AND completed_at IS NOT NULL
              AND completed_at > created_at
            GROUP BY priority
            ORDER BY avg_hours ASC
        """)

        by_priority = {}
        overall_sum = 0.0
        overall_count = 0

        for r in rows:
            d = dict(r._mapping)
            prio = d.get("priority", "unknown") or "unknown"
            avg_h = float(d.get("avg_hours") or 0)
            cnt = int(d.get("total") or 0)
            overall_sum += avg_h * cnt
            overall_count += cnt

            target_hours = {
                "emergency": 4, "critical": 8,
                "high": 24, "medium": 72, "low": 168
            }.get(prio.lower(), 72)

            by_priority[prio] = {
                "avg_hours": avg_h,
                "min_hours": float(d.get("min_hours") or 0),
                "max_hours": float(d.get("max_hours") or 0),
                "total_completed": cnt,
                "target_hours": target_hours,
                "meets_target": avg_h <= target_hours,
                "gap_hours": round(max(0, avg_h - target_hours), 1),
            }

        overall_mttr = round(overall_sum / max(overall_count, 1), 1)
        return {
            "hotel_id": self.hid,
            "overall_mttr_hours": overall_mttr,
            "overall_mttr_days": round(overall_mttr / 24, 1),
            "total_measured": overall_count,
            "by_priority": by_priority,
            "data_note": "Negative MTTR records excluded (data quality guard)",
        }

    def proactive_vs_reactive(self) -> dict:
        """
        Proactive vs reactive maintenance ratio.
        Uses work_orders.type column to classify:
          Proactive: 'preventive', 'pm', 'inspection', 'planned'
          Reactive:  'corrective', 'emergency', 'reactive', 'breakdown'
          Other:     everything else
        """
        PROACTIVE_TYPES = {
            'preventive', 'pm', 'inspection', 'planned',
            'scheduled', 'routine', 'preventative'
        }
        REACTIVE_TYPES = {
            'corrective', 'emergency', 'reactive',
            'breakdown', 'repair', 'unplanned', 'urgent'
        }

        rows = self._q("""
            SELECT
                LOWER(COALESCE(type, 'unknown')) as wo_type,
                COUNT(*) as cnt,
                COUNT(CASE WHEN status='completed' THEN 1 END) as completed
            FROM work_orders
            WHERE hotel_id = :h
              AND deleted_at IS NULL
            GROUP BY LOWER(COALESCE(type, 'unknown'))
            ORDER BY cnt DESC
        """)

        proactive = 0
        reactive = 0
        other = 0
        type_breakdown = {}

        for r in rows:
            d = dict(r._mapping)
            wo_type = d.get("wo_type", "unknown") or "unknown"
            cnt = int(d.get("cnt") or 0)
            type_breakdown[wo_type] = cnt
            if wo_type in PROACTIVE_TYPES:
                proactive += cnt
            elif wo_type in REACTIVE_TYPES:
                reactive += cnt
            else:
                other += cnt

        total = proactive + reactive + other
        proactive_pct = round(proactive / max(total, 1) * 100, 1)
        reactive_pct = round(reactive / max(total, 1) * 100, 1)
        other_pct = round(other / max(total, 1) * 100, 1)

        # Industry target: 70% proactive, 30% reactive
        target_proactive_pct = 70.0
        status = (
            "GOOD" if proactive_pct >= target_proactive_pct else
            "WARNING" if proactive_pct >= 50 else
            "CRITICAL"
        )

        return {
            "hotel_id": self.hid,
            "summary": {
                "total_work_orders": total,
                "proactive_count": proactive,
                "reactive_count": reactive,
                "other_count": other,
                "proactive_pct": proactive_pct,
                "reactive_pct": reactive_pct,
                "other_pct": other_pct,
            },
            "assessment": {
                "status": status,
                "target_proactive_pct": target_proactive_pct,
                "gap_to_target_pct": round(
                    max(0, target_proactive_pct - proactive_pct), 1
                ),
                "recommendation": (
                    "Proactive maintenance ratio meets industry target."
                    if status == "GOOD" else
                    f"Increase proactive maintenance from {proactive_pct}% toward {target_proactive_pct}% target."
                ),
            },
            "type_breakdown": type_breakdown,
        }

    def repeat_failure_rate(self, threshold: int = 3) -> dict:
        """
        Assets with repeat failures (multiple WOs in last 90 days).
        threshold: minimum WO count to flag as repeat failure.
        Returns assets sorted by WO count descending.
        """
        rows = self._q("""
            SELECT
                COALESCE(asset_id, 'unlinked') as asset_id,
                COUNT(*) as wo_count,
                COUNT(CASE WHEN priority IN ('critical','emergency') THEN 1 END) as critical_count,
                MAX(created_at) as last_wo_date,
                MIN(created_at) as first_wo_date
            FROM work_orders
            WHERE hotel_id = :h
              AND deleted_at IS NULL
              AND created_at >= NOW() - INTERVAL '90 days'
              AND asset_id IS NOT NULL
            GROUP BY asset_id
            HAVING COUNT(*) >= :threshold
            ORDER BY wo_count DESC
            LIMIT 20
        """, {"h": self.hid, "threshold": threshold})

        flagged_assets = []
        for r in rows:
            d = dict(r._mapping)
            flagged_assets.append({
                "asset_id": d.get("asset_id"),
                "wo_count_90d": int(d.get("wo_count") or 0),
                "critical_count": int(d.get("critical_count") or 0),
                "last_wo_date": str(d.get("last_wo_date", ""))[:10],
                "first_wo_date": str(d.get("first_wo_date", ""))[:10],
                "risk_level": (
                    "CRITICAL" if int(d.get("critical_count") or 0) >= 2 else
                    "HIGH" if int(d.get("wo_count") or 0) >= 5 else
                    "MEDIUM"
                ),
            })

        total_assets_checked = self._scalar_q("""
            SELECT COUNT(DISTINCT asset_id) FROM work_orders
            WHERE hotel_id=:h AND deleted_at IS NULL
              AND created_at >= NOW() - INTERVAL '90 days'
              AND asset_id IS NOT NULL
        """)

        return {
            "hotel_id": self.hid,
            "period_days": 90,
            "threshold_wos": threshold,
            "total_assets_with_wos": total_assets_checked,
            "repeat_failure_assets": len(flagged_assets),
            "repeat_failure_rate_pct": round(
                len(flagged_assets) / max(total_assets_checked, 1) * 100, 1
            ),
            "flagged_assets": flagged_assets,
        }

    def _scalar_q(self, sql: str, params: dict = None) -> int:
        try:
            result = self.db.execute(
                __import__("sqlalchemy").text(sql),
                params or {"h": self.hid}
            ).scalar()
            return int(result or 0)
        except Exception:
            try: self.db.rollback()
            except: pass
            return 0

    def monthly_trend_with_direction(self, months: int = 4) -> dict:
        """
        Month-over-month KPI trend with direction labels.
        Returns: improving / degrading / stable per KPI per month.
        """
        monthly_data = self.monthly_kpis(months=months)

        if len(monthly_data) < 2:
            return {
                "hotel_id": self.hid,
                "months_available": len(monthly_data),
                "trend_direction": "INSUFFICIENT_DATA",
                "monthly_data": monthly_data,
            }

        # Compare most recent two months
        current = monthly_data[0]
        previous = monthly_data[1]

        def direction(curr_val, prev_val, higher_is_better=True):
            if prev_val == 0:
                return "stable"
            change = (curr_val - prev_val) / prev_val * 100
            if abs(change) < 2:
                return "stable"
            if higher_is_better:
                return "improving" if change > 0 else "degrading"
            else:
                return "improving" if change < 0 else "degrading"

        directions = {
            "completion_rate": direction(
                current["completion_rate_pct"],
                previous["completion_rate_pct"]
            ),
            "avg_completion_hours": direction(
                current["avg_completion_hours"],
                previous["avg_completion_hours"],
                higher_is_better=False
            ),
            "sla_compliance": direction(
                current["sla_compliance_pct"],
                previous["sla_compliance_pct"]
            ),
        }

        improving_count = sum(1 for v in directions.values() if v == "improving")
        overall = (
            "IMPROVING" if improving_count >= 2 else
            "DEGRADING" if improving_count == 0 else
            "MIXED"
        )

        return {
            "hotel_id": self.hid,
            "months_available": len(monthly_data),
            "overall_trend": overall,
            "kpi_directions": directions,
            "current_month": current,
            "previous_month": previous,
            "monthly_data": monthly_data,
        }

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
