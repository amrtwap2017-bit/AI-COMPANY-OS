"""
PM Engine Service — Triangle Black A-005
Preventive Maintenance compliance, scheduling, and executive dashboard.

Does NOT duplicate:
- pm_plan_api (CRUD for maintenance_plans — prefix /maintenance/pm-plans-v2)
- maintenance_enterprise (DDD service layer)
- asset_intelligence/alerts (maintenance date alerts from assets table)

Adds NEW executive-level PM analytics:
- PM Compliance % by category (Completed / Scheduled × 100)
- 30-day maintenance schedule with status classification
- Overdue maintenance with urgency ranking
- PM summary for executive dashboard

SCHEMA FACTS (verified from live DB):
- maintenance_plans: id, hotel_id, asset_node_id, title, plan_type,
  frequency, next_due_date, last_completed_date, status, owner, notes
  NOTE: asset_node_id links to assets.id (NOT a separate column)
- assets: id, hotel_id, category, criticality, name, status,
  next_maintenance_date, last_maintenance_date, service_frequency
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text


class PMEngineService:
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

    def pm_compliance_by_category(self) -> dict:
        """
        PM Compliance = Completed PM / Scheduled PM × 100
        Uses maintenance_plans (hotel_id scoped) joined to assets for category.
        Handles empty maintenance_plans gracefully.
        """
        # From maintenance_plans + asset category join
        rows = self._q("""
            SELECT
                COALESCE(a.category, 'Uncategorized') AS category,
                COUNT(mp.id) AS scheduled,
                COUNT(mp.id) FILTER (WHERE mp.next_due_date IS NULL OR mp.next_due_date::DATE >= CURRENT_DATE) AS completed,
                COUNT(mp.id) FILTER (WHERE LOWER(mp.status) IN ('pending','overdue','active')) AS pending,
                ROUND(
                    100.0 * COUNT(mp.id) FILTER (WHERE mp.next_due_date IS NULL OR mp.next_due_date::DATE >= CURRENT_DATE)
                    / NULLIF(COUNT(mp.id), 0),
                    1
                ) AS compliance_pct
            FROM maintenance_plans mp
            LEFT JOIN assets a ON a.id = mp.asset_node_id
                AND a.hotel_id = :hid
            WHERE mp.hotel_id = :hid
            GROUP BY COALESCE(a.category, 'Uncategorized')
            ORDER BY compliance_pct ASC NULLS LAST
        """)

        # Also compute from assets directly (service_frequency + maintenance dates)
        asset_pm = self._q("""
            SELECT
                category,
                COUNT(*) AS total_assets,
                COUNT(*) FILTER (WHERE next_maintenance_date IS NOT NULL) AS scheduled_assets,
                COUNT(*) FILTER (WHERE next_maintenance_date < CURRENT_DATE) AS overdue_assets,
                COUNT(*) FILTER (WHERE next_maintenance_date IS NULL) AS unscheduled_assets,
                ROUND(
                    100.0 * COUNT(*) FILTER (WHERE next_maintenance_date IS NOT NULL
                        AND next_maintenance_date >= CURRENT_DATE)
                    / NULLIF(COUNT(*), 0),
                    1
                ) AS asset_schedule_pct
            FROM assets
            WHERE hotel_id = :hid AND deleted_at IS NULL
            GROUP BY category
            ORDER BY asset_schedule_pct ASC NULLS LAST
        """)

        total_plans = self._scalar(
            """
                SELECT COUNT(mp.id) FROM maintenance_plans mp
                JOIN assets a ON a.id = mp.asset_node_id
                WHERE a.hotel_id = :hid
            """)
        completed_plans = self._scalar("""
                SELECT COUNT(mp.id) FROM maintenance_plans mp
                JOIN assets a ON a.id = mp.asset_node_id
                WHERE a.hotel_id = :hid AND LOWER(mp.status) = 'active' AND (mp.next_due_date IS NULL OR mp.next_due_date::DATE >= CURRENT_DATE)
            """)

        overall_compliance = round(completed_plans / max(total_plans, 1) * 100, 1)

        return {
            "hotel_id": self.hid,
            "overall_compliance_pct": overall_compliance,
            "total_plans": total_plans,
            "on_schedule_plans": completed_plans,  # plans not yet overdue
            "pending_plans": total_plans - completed_plans,  # overdue count
            "by_category": [dict(r._mapping) for r in rows],
            "asset_schedule_status": [dict(r._mapping) for r in asset_pm],
            "compliance_grade": (
                "A+" if overall_compliance >= 90 else
                "A" if overall_compliance >= 80 else
                "B" if overall_compliance >= 65 else
                "C" if overall_compliance >= 50 else
                "D"
            )
        }

    def maintenance_schedule_30d(self) -> dict:
        """
        30-day maintenance schedule using assets.next_maintenance_date.
        Includes overdue items (negative days_until_due).
        """
        rows = self._q("""
            SELECT
                a.id,
                a.name AS asset_name,
                a.category,
                a.criticality,
                a.status AS asset_status,
                a.next_maintenance_date AS scheduled_date,
                a.last_maintenance_date,
                a.service_frequency,
                a.location_description AS location,
                EXTRACT(DAY FROM (a.next_maintenance_date - NOW()))::INTEGER AS days_until_due,
                CASE
                    WHEN a.next_maintenance_date < NOW() THEN 'OVERDUE'
                    WHEN a.next_maintenance_date::date = CURRENT_DATE THEN 'DUE_TODAY'
                    WHEN a.next_maintenance_date < NOW() + INTERVAL '7 days' THEN 'DUE_THIS_WEEK'
                    WHEN a.next_maintenance_date < NOW() + INTERVAL '30 days' THEN 'DUE_THIS_MONTH'
                    ELSE 'SCHEDULED'
                END AS schedule_status
            FROM assets a
            WHERE a.hotel_id = :hid
              AND a.deleted_at IS NULL
              AND a.next_maintenance_date IS NOT NULL
              AND a.next_maintenance_date < NOW() + INTERVAL '30 days'
            ORDER BY a.next_maintenance_date ASC
            LIMIT 100
        """)

        schedule = [dict(r._mapping) for r in rows]

        # Also get from maintenance_plans
        plan_rows = self._q("""
            SELECT
                mp.id, mp.title, mp.frequency, mp.next_due_date,
                mp.status, mp.owner,
                a.name AS asset_name, a.category, a.criticality,
                EXTRACT(DAY FROM (mp.next_due_date - NOW()))::INTEGER AS days_until_due,
                CASE
                    WHEN mp.next_due_date < NOW() THEN 'OVERDUE'
                    WHEN mp.next_due_date::date = CURRENT_DATE THEN 'DUE_TODAY'
                    WHEN mp.next_due_date < NOW() + INTERVAL '7 days' THEN 'DUE_THIS_WEEK'
                    WHEN mp.next_due_date < NOW() + INTERVAL '30 days' THEN 'DUE_THIS_MONTH'
                    ELSE 'SCHEDULED'
                END AS schedule_status
            FROM maintenance_plans mp
            LEFT JOIN assets a ON a.id = mp.asset_node_id
            WHERE mp.hotel_id = :hid
              AND LOWER(mp.status) != 'completed'
              AND mp.next_due_date < NOW() + INTERVAL '30 days'
            ORDER BY mp.next_due_date ASC
            LIMIT 50
        """)

        plans_schedule = [dict(r._mapping) for r in plan_rows]

        return {
            "hotel_id": self.hid,
            "schedule_period": "30_days",
            "generated_at": datetime.utcnow().isoformat(),
            "asset_schedule": {
                "total": len(schedule),
                "overdue": [s for s in schedule if s.get("schedule_status") == "OVERDUE"],
                "due_today": [s for s in schedule if s.get("schedule_status") == "DUE_TODAY"],
                "due_this_week": [s for s in schedule if s.get("schedule_status") == "DUE_THIS_WEEK"],
                "due_this_month": [s for s in schedule if s.get("schedule_status") == "DUE_THIS_MONTH"],
            },
            "plan_schedule": {
                "total": len(plans_schedule),
                "items": plans_schedule[:20]
            }
        }

    def overdue_maintenance(self) -> dict:
        """
        All overdue maintenance items with urgency ranking.
        Priority: critical assets overdue → high → medium → low
        """
        asset_overdue = self._q("""
            SELECT
                a.id, a.name, a.category, a.criticality, a.status,
                a.next_maintenance_date,
                a.last_maintenance_date,
                a.location_description AS location,
                EXTRACT(DAY FROM (NOW() - a.next_maintenance_date))::INTEGER AS days_overdue,
                CASE a.criticality
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    ELSE 4
                END AS urgency_rank
            FROM assets a
            WHERE a.hotel_id = :hid
              AND a.deleted_at IS NULL
              AND a.next_maintenance_date IS NOT NULL
              AND a.next_maintenance_date < NOW()
            ORDER BY urgency_rank ASC, a.next_maintenance_date ASC
        """)

        plan_overdue = self._q("""
            SELECT
                mp.id, mp.title, mp.frequency, mp.next_due_date,
                mp.owner, mp.status,
                a.name AS asset_name, a.category, a.criticality,
                EXTRACT(DAY FROM (NOW() - mp.next_due_date))::INTEGER AS days_overdue
            FROM maintenance_plans mp
            LEFT JOIN assets a ON a.id = mp.asset_node_id
            WHERE mp.hotel_id = :hid
              AND LOWER(mp.status) IN ('pending','overdue','active')
              AND mp.next_due_date < NOW()
            ORDER BY
                CASE a.criticality WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
                mp.next_due_date ASC
            LIMIT 20
        """)

        asset_list = [dict(r._mapping) for r in asset_overdue]
        plan_list = [dict(r._mapping) for r in plan_overdue]

        return {
            "hotel_id": self.hid,
            "asset_overdue": asset_list,
            "asset_overdue_count": len(asset_list),
            "plan_overdue": plan_list,
            "plan_overdue_count": len(plan_list),
            "total_overdue": len(asset_list) + len(plan_list),
            "critical_overdue": sum(
                1 for a in asset_list if a.get("criticality") == "critical"
            ),
        }

    def pm_summary(self) -> dict:
        """Executive PM dashboard summary."""
        compliance = self.pm_compliance_by_category()
        overdue = self.overdue_maintenance()

        total_assets = self._scalar(
            "SELECT COUNT(*) FROM assets WHERE hotel_id = :hid AND deleted_at IS NULL"
        )
        unscheduled = self._scalar("""
            SELECT COUNT(*) FROM assets
            WHERE hotel_id = :hid AND deleted_at IS NULL
              AND next_maintenance_date IS NULL
        """)
        scheduled_pct = round((total_assets - unscheduled) / max(total_assets, 1) * 100, 1)

        insights = []
        if overdue["critical_overdue"] > 0:
            insights.append({
                "type": "CRITICAL_OVERDUE",
                "severity": "CRITICAL",
                "message": f"{overdue['critical_overdue']} CRITICAL assets are overdue for maintenance — immediate action required"
            })
        if overdue["total_overdue"] > 0:
            insights.append({
                "type": "MAINTENANCE_OVERDUE",
                "severity": "HIGH",
                "message": f"{overdue['total_overdue']} maintenance items are overdue"
            })
        if unscheduled > 0:
            insights.append({
                "type": "UNSCHEDULED_ASSETS",
                "severity": "HIGH",
                "message": f"{unscheduled} of {total_assets} assets ({100-scheduled_pct:.0f}%) have no maintenance schedule — this is a significant operational gap"
            })
        if compliance["overall_compliance_pct"] < 75:
            insights.append({
                "type": "LOW_PM_COMPLIANCE",
                "severity": "MEDIUM",
                "message": f"PM compliance is {compliance['overall_compliance_pct']}% — target is 90%+"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "pm_compliance_pct": compliance["overall_compliance_pct"],
            "compliance_grade": compliance["compliance_grade"],
            "total_plans": compliance["total_plans"],
            "on_schedule_plans": compliance.get("on_schedule_plans", compliance.get("completed_plans", 0)),
            "total_assets": total_assets,
            "scheduled_assets": total_assets - unscheduled,
            "unscheduled_assets": unscheduled,
            "schedule_coverage_pct": scheduled_pct,
            "overdue": {
                "total": overdue["total_overdue"],
                "critical": overdue["critical_overdue"],
                "asset_overdue": overdue["asset_overdue_count"],
            },
            "insights": insights,
            "top_overdue_assets": overdue["asset_overdue"][:5],
        }
