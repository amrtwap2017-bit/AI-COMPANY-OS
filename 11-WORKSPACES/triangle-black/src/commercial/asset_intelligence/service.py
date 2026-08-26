"""
Asset Intelligence Service — Triangle Black A-004
Provides per-asset health scoring, risk prediction, and maintenance alerts.
All queries tenant-isolated via hotel_id.

Does NOT duplicate:
- asset_lifecycle (TCO, replacement economics, PM effectiveness)
- predictive_maintenance (ML forecasting, anomalies)

Adds NEW:
- Asset Intelligence Score (0-100 per asset)
- Rule-based failure risk (at-risk assets)
- Maintenance due alerts (overdue + upcoming)
- Asset health summary with actionable insights
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text


class AssetIntelligenceService:
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

    def health_score_per_asset(self, limit: int = 50) -> list:
        """
        Asset Intelligence Score (0-100, higher = healthier).
        Formula based on real column values from DB:
        - criticality: critical=0pts, high=5, medium=15, low=20
        - status: Operational/Active=30, Maintenance=15, Failed=0
        - maintenance recency: maintained in last 90d=25, 180d=15, else=0
        - warranty: valid=15, expired/none=0
        - maintenance overdue: overdue=penalty(-10)
        """
        rows = self._q("""
            SELECT
                a.id,
                a.name,
                a.category,
                a.criticality,
                a.status,
                a.last_maintenance_date,
                a.next_maintenance_date,
                a.warranty_expiry,
                a.installation_date,
                a.location_description,
                a.manufacturer,
                a.model,
                COUNT(wo.id) AS total_work_orders,
                COUNT(wo.id) FILTER (WHERE wo.status IN ('open','in_progress')) AS open_work_orders,
                COUNT(wo.id) FILTER (WHERE LOWER(wo.priority) = 'critical') AS critical_wos,
                -- Maintenance recency score
                CASE
                    WHEN a.last_maintenance_date >= CURRENT_DATE - INTERVAL '90 days' THEN 25
                    WHEN a.last_maintenance_date >= CURRENT_DATE - INTERVAL '180 days' THEN 15
                    WHEN a.last_maintenance_date IS NOT NULL THEN 5
                    ELSE 0
                END AS maintenance_score,
                -- Status score
                CASE
                    WHEN LOWER(a.status) IN ('operational','active') THEN 30
                    WHEN LOWER(a.status) = 'maintenance' THEN 15
                    WHEN LOWER(a.status) = 'failed' THEN 0
                    ELSE 10
                END AS status_score,
                -- Criticality inverse score (lower criticality = higher score)
                CASE a.criticality
                    WHEN 'low' THEN 20
                    WHEN 'medium' THEN 15
                    WHEN 'high' THEN 5
                    WHEN 'critical' THEN 0
                    ELSE 10
                END AS criticality_score,
                -- Warranty score
                CASE
                    WHEN a.warranty_expiry IS NOT NULL AND a.warranty_expiry >= CURRENT_DATE THEN 15
                    ELSE 0
                END AS warranty_score,
                -- Overdue penalty
                CASE
                    WHEN a.next_maintenance_date IS NOT NULL
                         AND a.next_maintenance_date < CURRENT_DATE THEN -10
                    ELSE 0
                END AS overdue_penalty
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :hid
                AND wo.deleted_at IS NULL
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.id, a.name, a.category, a.criticality, a.status,
                     a.last_maintenance_date, a.next_maintenance_date,
                     a.warranty_expiry, a.installation_date,
                     a.location_description, a.manufacturer, a.model
            ORDER BY (
                CASE
                    WHEN a.last_maintenance_date >= CURRENT_DATE - INTERVAL '90 days' THEN 25
                    WHEN a.last_maintenance_date >= CURRENT_DATE - INTERVAL '180 days' THEN 15
                    WHEN a.last_maintenance_date IS NOT NULL THEN 5
                    ELSE 0
                END +
                CASE WHEN LOWER(a.status) IN ('operational','active') THEN 30
                     WHEN LOWER(a.status) = 'maintenance' THEN 15
                     ELSE 0 END +
                CASE a.criticality WHEN 'low' THEN 20 WHEN 'medium' THEN 15
                     WHEN 'high' THEN 5 ELSE 0 END +
                CASE WHEN a.warranty_expiry >= CURRENT_DATE THEN 15 ELSE 0 END
            ) ASC
            LIMIT :lim
        """, {"hid": self.hid, "lim": limit})

        result = []
        for r in rows:
            d = dict(r._mapping)
            raw_score = (
                d.get("maintenance_score", 0) +
                d.get("status_score", 0) +
                d.get("criticality_score", 0) +
                d.get("warranty_score", 0) +
                d.get("overdue_penalty", 0)
            )
            score = max(0, min(100, raw_score))
            grade = "A" if score >= 80 else "B" if score >= 60 else "C" if score >= 40 else "D"
            risk = "LOW" if score >= 80 else "MODERATE" if score >= 60 else "HIGH" if score >= 40 else "CRITICAL"

            result.append({
                "id": d["id"],
                "name": d["name"],
                "category": d["category"],
                "criticality": d["criticality"],
                "status": d["status"],
                "location": d.get("location_description", ""),
                "manufacturer": d.get("manufacturer", ""),
                "model": d.get("model", ""),
                "health_score": score,
                "grade": grade,
                "risk_level": risk,
                "last_maintenance": str(d.get("last_maintenance_date") or "Never"),
                "next_maintenance": str(d.get("next_maintenance_date") or "Not scheduled"),
                "warranty_expiry": str(d.get("warranty_expiry") or "No warranty"),
                "open_work_orders": d.get("open_work_orders", 0),
                "total_work_orders": d.get("total_work_orders", 0),
                "score_breakdown": {
                    "maintenance": d.get("maintenance_score", 0),
                    "status": d.get("status_score", 0),
                    "criticality": d.get("criticality_score", 0),
                    "warranty": d.get("warranty_score", 0),
                    "overdue_penalty": d.get("overdue_penalty", 0),
                }
            })

        return sorted(result, key=lambda x: x["health_score"])

    def at_risk_assets(self) -> list:
        """
        Rule-based failure prediction.
        At-risk = any of:
        - Overdue for maintenance (next_maintenance_date < today)
        - Failed status
        - Critical criticality + open work orders
        - Warranty expired + critical
        """
        rows = self._q("""
            SELECT
                a.id, a.name, a.category, a.criticality, a.status,
                a.next_maintenance_date, a.last_maintenance_date,
                a.warranty_expiry,
                COUNT(wo.id) FILTER (WHERE wo.status IN ('open','in_progress')) AS open_wos,
                ARRAY_AGG(
                    CASE
                        WHEN a.next_maintenance_date < CURRENT_DATE THEN 'OVERDUE_MAINTENANCE'
                        WHEN LOWER(a.status) = 'failed' THEN 'FAILED_STATUS'
                        WHEN a.criticality = 'critical'
                             AND COUNT(wo.id) FILTER (WHERE wo.status='open') > 0
                             THEN 'CRITICAL_WITH_OPEN_WO'
                        WHEN (a.warranty_expiry IS NULL OR a.warranty_expiry < CURRENT_DATE)
                             AND a.criticality = 'critical' THEN 'CRITICAL_NO_WARRANTY'
                        ELSE NULL
                    END
                ) FILTER (WHERE
                    a.next_maintenance_date < CURRENT_DATE
                    OR LOWER(a.status) = 'failed'
                    OR a.criticality = 'critical'
                ) AS risk_reasons
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :hid AND wo.deleted_at IS NULL
            WHERE a.hotel_id = :hid
              AND a.deleted_at IS NULL
              AND (
                  a.next_maintenance_date < CURRENT_DATE
                  OR LOWER(a.status) = 'failed'
                  OR (a.criticality = 'critical')
              )
            GROUP BY a.id, a.name, a.category, a.criticality, a.status,
                     a.next_maintenance_date, a.last_maintenance_date, a.warranty_expiry
            ORDER BY
                CASE LOWER(a.status) WHEN 'failed' THEN 0
                     WHEN 'maintenance' THEN 1 ELSE 2 END,
                a.criticality
            LIMIT 20
        """)

        return [dict(r._mapping) for r in rows]

    def maintenance_alerts(self) -> dict:
        """
        Maintenance due alerts:
        - Overdue (next_maintenance_date < today)
        - Due this week
        - Due this month
        - No maintenance date set
        """
        overdue = self._q("""
            SELECT id, name, category, criticality, next_maintenance_date,
                   last_maintenance_date
            FROM assets
            WHERE hotel_id = :hid AND deleted_at IS NULL
              AND next_maintenance_date IS NOT NULL
              AND next_maintenance_date < CURRENT_DATE
            ORDER BY next_maintenance_date ASC
            LIMIT 20
        """)

        due_week = self._q("""
            SELECT id, name, category, criticality, next_maintenance_date
            FROM assets
            WHERE hotel_id = :hid AND deleted_at IS NULL
              AND next_maintenance_date BETWEEN CURRENT_DATE
              AND CURRENT_DATE + INTERVAL '7 days'
            ORDER BY next_maintenance_date ASC
            LIMIT 20
        """)

        due_month = self._q("""
            SELECT id, name, category, criticality, next_maintenance_date
            FROM assets
            WHERE hotel_id = :hid AND deleted_at IS NULL
              AND next_maintenance_date BETWEEN CURRENT_DATE + INTERVAL '7 days'
              AND CURRENT_DATE + INTERVAL '30 days'
            ORDER BY next_maintenance_date ASC
            LIMIT 20
        """)

        no_schedule = self._scalar("""
            SELECT COUNT(*) FROM assets
            WHERE hotel_id = :hid AND deleted_at IS NULL
              AND next_maintenance_date IS NULL
        """)

        return {
            "overdue": [dict(r._mapping) for r in overdue],
            "due_this_week": [dict(r._mapping) for r in due_week],
            "due_this_month": [dict(r._mapping) for r in due_month],
            "overdue_count": len(overdue),
            "due_week_count": len(due_week),
            "due_month_count": len(due_month),
            "no_schedule_count": no_schedule,
            "total_alerts": len(overdue) + len(due_week),
        }

    def summary(self) -> dict:
        """Top-level asset intelligence summary."""
        scores = self.health_score_per_asset(limit=200)
        alerts = self.maintenance_alerts()
        at_risk = self.at_risk_assets()

        total = len(scores)
        if total == 0:
            return {"error": "No assets found for this tenant"}

        avg_score = round(sum(a["health_score"] for a in scores) / total, 1)
        grade_dist = {}
        risk_dist = {}
        for a in scores:
            grade_dist[a["grade"]] = grade_dist.get(a["grade"], 0) + 1
            risk_dist[a["risk_level"]] = risk_dist.get(a["risk_level"], 0) + 1

        worst_5 = scores[:5]  # Already sorted ascending by health_score
        best_5 = scores[-5:]  # Healthiest

        insight = []
        if alerts["overdue_count"] > 0:
            insight.append({
                "type": "MAINTENANCE_OVERDUE",
                "severity": "CRITICAL",
                "message": f"{alerts['overdue_count']} assets are overdue for maintenance"
            })
        if risk_dist.get("CRITICAL", 0) > 0:
            insight.append({
                "type": "CRITICAL_RISK_ASSETS",
                "severity": "HIGH",
                "message": f"{risk_dist['CRITICAL']} assets have CRITICAL risk score"
            })
        if avg_score < 50:
            insight.append({
                "type": "LOW_FLEET_HEALTH",
                "severity": "HIGH",
                "message": f"Fleet health score is {avg_score}/100 — below acceptable threshold"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "fleet_health_score": avg_score,
            "total_assets": total,
            "grade_distribution": grade_dist,
            "risk_distribution": risk_dist,
            "maintenance_alerts": {
                "overdue": alerts["overdue_count"],
                "due_this_week": alerts["due_week_count"],
                "due_this_month": alerts["due_month_count"],
                "not_scheduled": alerts["no_schedule_count"],
            },
            "at_risk_count": len(at_risk),
            "insights": insight,
            "worst_assets": worst_5,
            "best_assets": best_5,
        }
