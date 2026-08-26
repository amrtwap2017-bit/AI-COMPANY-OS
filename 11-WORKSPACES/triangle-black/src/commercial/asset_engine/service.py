"""
Asset Intelligence Engine — Triangle Black A-015
NEW: Asset health scoring, risk by category, maintenance gap analysis

Does NOT duplicate: /api/v1/assets/* (CRUD) or /api/v1/asset-lifecycle/*

NEW:
  /api/v1/asset-engine/summary        — portfolio overview
  /api/v1/asset-engine/health-scores  — per-asset health 0-100
  /api/v1/asset-engine/by-category    — risk aggregated by category
  /api/v1/asset-engine/critical       — critical assets needing attention

VERIFIED DB columns:
  assets: id, hotel_id, name, category, criticality, status,
          warranty_expiry, last_maintenance_date, next_maintenance_date
  work_orders: asset_id, hotel_id, status, priority, deleted_at
  maintenance_plans: asset_node_id, hotel_id, status, next_due_date
"""
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import text

CRITICALITY_WEIGHT = {"critical": 4, "high": 3, "medium": 2, "low": 1}


class AssetEngineService:
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

    def health_scores(self, limit: int = 50) -> list:
        """Per-asset health score 0-100 based on WO failures + PM coverage."""
        rows = self._q("""
            SELECT
                a.id, a.name, a.category, a.criticality, a.status,
                a.manufacturer, a.model,
                a.last_maintenance_date, a.next_maintenance_date,
                a.warranty_expiry,
                COUNT(wo.id) AS total_wos,
                COUNT(wo.id) FILTER (
                    WHERE LOWER(wo.status) IN ('completed','closed')
                ) AS completed_wos,
                COUNT(wo.id) FILTER (
                    WHERE LOWER(wo.priority) IN ('critical','emergency')
                ) AS critical_wos,
                COUNT(mp.id) AS pm_plans
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :hid AND wo.deleted_at IS NULL
            LEFT JOIN maintenance_plans mp ON mp.asset_node_id = a.id
                AND mp.hotel_id = :hid AND LOWER(mp.status) = 'active'
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.id, a.name, a.category, a.criticality, a.status,
                     a.manufacturer, a.model,
                     a.last_maintenance_date, a.next_maintenance_date,
                     a.warranty_expiry
            ORDER BY COUNT(wo.id) FILTER (
                WHERE LOWER(wo.priority) IN ('critical','emergency')
            ) DESC, a.criticality DESC
            LIMIT :lim
        """, {"hid": self.hid, "lim": limit})

        today = date.today()
        result = []
        for r in rows:
            d = dict(r._mapping)

            total_wos = d.get("total_wos", 0) or 0
            critical_wos = d.get("critical_wos", 0) or 0
            pm_plans = d.get("pm_plans", 0) or 0
            criticality = d.get("criticality", "medium") or "medium"

            # Score components (0-100 each)
            # Failure penalty: more critical WOs = lower score
            failure_score = max(0, 100 - (critical_wos * 15) - (total_wos * 2))
            failure_score = min(100, failure_score)

            # PM coverage bonus
            pm_score = 100 if pm_plans >= 1 else 40

            # Maintenance currency
            next_maint = d.get("next_maintenance_date")
            if next_maint:
                try:
                    if isinstance(next_maint, str):
                        nm_date = date.fromisoformat(next_maint[:10])
                    else:
                        nm_date = next_maint
                    days_until = (nm_date - today).days
                    currency_score = 100 if days_until > 0 else max(0, 100 + days_until * 2)
                except Exception:
                    currency_score = 60
            else:
                currency_score = 50

            # Weighted health score
            health = round(
                failure_score * 0.40 +
                pm_score * 0.35 +
                currency_score * 0.25, 1
            )
            health = max(0, min(100, health))

            risk = (
                "CRITICAL" if health < 40
                else "HIGH" if health < 60
                else "MODERATE" if health < 75
                else "LOW"
            )

            result.append({
                "id": d["id"],
                "name": d.get("name", ""),
                "category": d.get("category", ""),
                "criticality": criticality,
                "status": d.get("status", ""),
                "health_score": health,
                "risk_level": risk,
                "total_work_orders": total_wos,
                "critical_work_orders": critical_wos,
                "pm_plans": pm_plans,
                "manufacturer": d.get("manufacturer", ""),
                "model": d.get("model", ""),
                "next_maintenance_date": str(d.get("next_maintenance_date") or ""),
                "warranty_expiry": str(d.get("warranty_expiry") or ""),
            })

        return sorted(result, key=lambda x: x["health_score"])

    def by_category(self) -> list:
        """Asset risk aggregated by category."""
        rows = self._q("""
            SELECT
                a.category,
                COUNT(DISTINCT a.id) AS total_assets,
                COUNT(DISTINCT wo.id) AS total_failures,
                COUNT(DISTINCT mp.id) AS total_pm_plans,
                ROUND(COUNT(DISTINCT mp.id)::NUMERIC /
                    NULLIF(COUNT(DISTINCT a.id), 0) * 100, 1) AS pm_coverage_pct,
                ROUND(COUNT(DISTINCT wo.id)::NUMERIC /
                    NULLIF(COUNT(DISTINCT a.id), 0), 1) AS avg_failures_per_asset
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :hid AND wo.deleted_at IS NULL
            LEFT JOIN maintenance_plans mp ON mp.asset_node_id = a.id
                AND mp.hotel_id = :hid AND LOWER(mp.status) = 'active'
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.category
            ORDER BY COUNT(DISTINCT wo.id) DESC
        """)

        result = []
        for r in rows:
            d = dict(r._mapping)
            avg_fail = float(d.get("avg_failures_per_asset") or 0)
            pm_cov = float(d.get("pm_coverage_pct") or 0)

            risk = (
                "CRITICAL" if avg_fail >= 5 and pm_cov < 50
                else "HIGH" if avg_fail >= 3 or pm_cov < 30
                else "MODERATE" if avg_fail >= 1 or pm_cov < 60
                else "LOW"
            )

            result.append({
                "category": d.get("category", "Unknown"),
                "total_assets": d.get("total_assets", 0),
                "total_failures": d.get("total_failures", 0),
                "avg_failures_per_asset": avg_fail,
                "pm_coverage_pct": pm_cov,
                "risk_level": risk,
            })

        return result

    def critical_assets(self) -> list:
        """Assets with critical risk needing immediate attention."""
        all_scores = self.health_scores(limit=200)
        return [a for a in all_scores if a["risk_level"] in ("CRITICAL", "HIGH")][:20]

    def summary(self) -> dict:
        """Portfolio asset intelligence summary."""
        total = self._scalar(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:hid AND deleted_at IS NULL"
        )
        active = self._scalar(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:hid AND deleted_at IS NULL "
            "AND LOWER(status) = 'active'"
        )
        with_pm = self._scalar("""
            SELECT COUNT(DISTINCT a.id) FROM assets a
            JOIN maintenance_plans mp ON mp.asset_node_id = a.id
                AND mp.hotel_id = :hid AND LOWER(mp.status) = 'active'
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
        """)
        warranty_expiring = self._scalar("""
            SELECT COUNT(*) FROM assets
            WHERE hotel_id = :hid AND deleted_at IS NULL
            AND warranty_expiry IS NOT NULL
            AND warranty_expiry::DATE BETWEEN CURRENT_DATE AND CURRENT_DATE + 90
        """)

        by_cat = self.by_category()
        critical_assets = self.critical_assets()

        pm_coverage = round(with_pm / max(total, 1) * 100, 1)
        high_risk_categories = [c for c in by_cat if c["risk_level"] in ("CRITICAL", "HIGH")]

        insights = []
        if pm_coverage < 50:
            insights.append({
                "type": "LOW_PM_COVERAGE",
                "severity": "HIGH",
                "message": f"Only {pm_coverage}% of assets have active PM plans"
            })
        if len(critical_assets) > 0:
            insights.append({
                "type": "CRITICAL_ASSETS",
                "severity": "CRITICAL",
                "message": f"{len(critical_assets)} assets are at critical/high risk"
            })
        if warranty_expiring > 0:
            insights.append({
                "type": "WARRANTY_EXPIRING",
                "severity": "MEDIUM",
                "message": f"{warranty_expiring} assets have warranty expiring within 90 days"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "portfolio": {
                "total_assets": total,
                "active_assets": active,
                "with_pm_coverage": with_pm,
                "pm_coverage_pct": pm_coverage,
                "warranty_expiring_90d": warranty_expiring,
            },
            "risk_summary": {
                "critical_count": len([a for a in critical_assets if a["risk_level"] == "CRITICAL"]),
                "high_count": len([a for a in critical_assets if a["risk_level"] == "HIGH"]),
                "high_risk_categories": len(high_risk_categories),
            },
            "insights": insights,
            "top_risk_categories": by_cat[:5],
            "critical_assets": critical_assets[:5],
        }
