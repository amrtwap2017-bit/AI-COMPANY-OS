"""
Operational Risk Engine — Triangle Black A-021
FINAL intelligence layer: composite risk scoring + predictive alerts

NEW:
  /api/v1/risk-engine/summary         — composite operational risk
  /api/v1/risk-engine/asset-risk      — per-asset predictive risk score
  /api/v1/risk-engine/operational     — real-time operational risk
  /api/v1/risk-engine/forecast        — 30-day risk forecast

Does NOT duplicate: /api/v1/risk-intelligence/* (existing)
"""
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text


class RiskEngineService:
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

    def asset_risk_scores(self, limit: int = 30) -> list:
        """Predictive risk score per asset based on failure history + PM gap."""
        rows = self._q("""
            SELECT
                a.id, a.name, a.category, a.criticality,
                COUNT(wo.id) AS total_failures,
                COUNT(wo.id) FILTER (
                    WHERE wo.created_at >= NOW() - INTERVAL '90 days'
                ) AS recent_failures_90d,
                COUNT(wo.id) FILTER (
                    WHERE LOWER(wo.priority) IN ('critical','emergency')
                ) AS critical_failures,
                COUNT(mp.id) AS pm_plans,
                a.next_maintenance_date,
                a.warranty_expiry
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :hid AND wo.deleted_at IS NULL
            LEFT JOIN maintenance_plans mp ON mp.asset_node_id = a.id
                AND mp.hotel_id = :hid AND LOWER(mp.status) = 'active'
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.id, a.name, a.category, a.criticality,
                     a.next_maintenance_date, a.warranty_expiry
            ORDER BY recent_failures_90d DESC, critical_failures DESC
            LIMIT :lim
        """, {"hid": self.hid, "lim": limit})

        today = date.today()
        result = []
        for r in rows:
            d = dict(r._mapping)
            total_fail = d.get("total_failures", 0) or 0
            recent = d.get("recent_failures_90d", 0) or 0
            critical = d.get("critical_failures", 0) or 0
            pm_plans = d.get("pm_plans", 0) or 0
            criticality = d.get("criticality", "medium") or "medium"

            # Risk factors (each 0-100)
            failure_risk = min(100, recent * 20 + critical * 30)
            pm_gap_risk = 0 if pm_plans > 0 else 60
            criticality_mult = {"critical": 1.5, "high": 1.2, "medium": 1.0, "low": 0.7}.get(criticality, 1.0)

            # Maintenance currency risk
            next_maint = d.get("next_maintenance_date")
            maint_risk = 0
            if next_maint:
                try:
                    nm = next_maint if isinstance(next_maint, date) else date.fromisoformat(str(next_maint)[:10])
                    days_overdue = (today - nm).days
                    maint_risk = min(100, max(0, days_overdue * 3)) if days_overdue > 0 else 0
                except Exception:
                    maint_risk = 30

            # Composite risk score
            raw_risk = (failure_risk * 0.40 + pm_gap_risk * 0.35 + maint_risk * 0.25) * criticality_mult
            risk_score = min(100, round(raw_risk, 1))

            risk_level = (
                "CRITICAL" if risk_score >= 80
                else "HIGH" if risk_score >= 60
                else "MODERATE" if risk_score >= 35
                else "LOW"
            )

            result.append({
                "id": d["id"],
                "name": d.get("name", ""),
                "category": d.get("category", ""),
                "criticality": criticality,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "total_failures": total_fail,
                "recent_failures_90d": recent,
                "critical_failures": critical,
                "pm_coverage": pm_plans > 0,
                "factors": {
                    "failure_risk": round(failure_risk, 1),
                    "pm_gap_risk": pm_gap_risk,
                    "maintenance_overdue_risk": maint_risk,
                }
            })

        return sorted(result, key=lambda x: x["risk_score"], reverse=True)

    def operational_risk(self) -> dict:
        """Real-time operational risk from SLA + WO + PM data."""
        # SLA risk
        open_breached = self._scalar(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid "
            "AND deleted_at IS NULL AND LOWER(status) IN ('open','in_progress') "
            "AND sla_breached=TRUE"
        )
        total_open = self._scalar(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid "
            "AND deleted_at IS NULL AND LOWER(status) IN ('open','in_progress')"
        )
        sla_risk = round(open_breached / max(total_open, 1) * 100, 1)

        # PM risk
        total_plans = self._scalar(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:hid AND LOWER(status)='active'"
        )
        overdue_plans = self._scalar(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:hid "
            "AND LOWER(status)='active' AND next_due_date < CURRENT_DATE"
        )
        pm_risk = round(overdue_plans / max(total_plans, 1) * 100, 1)

        # Asset risk
        asset_scores = self.asset_risk_scores(limit=100)
        critical_assets = sum(1 for a in asset_scores if a["risk_level"] in ("CRITICAL", "HIGH"))
        asset_risk = round(critical_assets / max(len(asset_scores), 1) * 100, 1)

        # Procurement risk (pending approvals)
        pending_pos = self._scalar(
            "SELECT COUNT(*) FROM purchase_orders WHERE hotel_id=:hid "
            "AND LOWER(status) IN ('pending','draft') AND approved_by IS NULL"
        )
        total_pos = self._scalar(
            "SELECT COUNT(*) FROM purchase_orders WHERE hotel_id=:hid"
        )
        proc_risk = round(pending_pos / max(total_pos, 1) * 100, 1)

        # Composite operational risk
        composite = round(
            sla_risk * 0.35 +
            pm_risk * 0.25 +
            asset_risk * 0.25 +
            proc_risk * 0.15, 1
        )

        risk_level = (
            "CRITICAL" if composite >= 70
            else "HIGH" if composite >= 50
            else "MODERATE" if composite >= 30
            else "LOW"
        )

        return {
            "composite_risk_score": composite,
            "risk_level": risk_level,
            "components": {
                "sla_risk": {"score": sla_risk, "detail": f"{open_breached} breached / {total_open} open"},
                "pm_risk": {"score": pm_risk, "detail": f"{overdue_plans} overdue / {total_plans} plans"},
                "asset_risk": {"score": asset_risk, "detail": f"{critical_assets} critical/high"},
                "procurement_risk": {"score": proc_risk, "detail": f"{pending_pos} pending / {total_pos} total"},
            }
        }

    def forecast(self) -> dict:
        """30-day risk forecast based on current trends."""
        today = date.today()
        plans_due_30d = self._scalar("""
            SELECT COUNT(*) FROM maintenance_plans
            WHERE hotel_id=:hid AND LOWER(status)='active'
            AND next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
        """)
        warranties_expiring = self._scalar("""
            SELECT COUNT(*) FROM assets
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND warranty_expiry IS NOT NULL
            AND warranty_expiry::DATE BETWEEN CURRENT_DATE AND CURRENT_DATE + 90
        """)
        avg_monthly_wos = self._scalar("""
            SELECT COALESCE(COUNT(*) / 3.0, 0) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND created_at >= NOW() - INTERVAL '90 days'
        """)

        events = []
        if plans_due_30d > 0:
            events.append({
                "type": "PM_DUE",
                "severity": "MEDIUM",
                "count": plans_due_30d,
                "description": f"{plans_due_30d} PM plans due in next 30 days",
                "due_date": (today + timedelta(days=30)).isoformat(),
            })
        if warranties_expiring > 0:
            events.append({
                "type": "WARRANTY_EXPIRY",
                "severity": "MEDIUM",
                "count": warranties_expiring,
                "description": f"{warranties_expiring} asset warranties expiring in 90 days",
            })

        return {
            "hotel_id": self.hid,
            "forecast_period": "30_days",
            "forecast_start": today.isoformat(),
            "forecast_end": (today + timedelta(days=30)).isoformat(),
            "predicted_wo_count": int(avg_monthly_wos),
            "upcoming_events": events,
            "risk_level": "MODERATE" if events else "LOW",
        }

    def summary(self) -> dict:
        """Composite operational risk intelligence summary."""
        asset_risks = self.asset_risk_scores(limit=100)
        operational = self.operational_risk()
        forecast = self.forecast()

        critical_assets = [a for a in asset_risks if a["risk_level"] == "CRITICAL"]
        high_assets = [a for a in asset_risks if a["risk_level"] == "HIGH"]

        insights = []
        if operational["risk_level"] in ("CRITICAL", "HIGH"):
            insights.append({
                "type": "HIGH_OPERATIONAL_RISK",
                "severity": operational["risk_level"],
                "message": f"Composite operational risk score: {operational['composite_risk_score']}/100"
            })
        if critical_assets:
            insights.append({
                "type": "CRITICAL_ASSET_RISK",
                "severity": "CRITICAL",
                "message": f"{len(critical_assets)} assets at critical risk — immediate attention required"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "operational_risk": operational,
            "asset_risk_summary": {
                "total_scored": len(asset_risks),
                "critical": len(critical_assets),
                "high": len(high_assets),
                "moderate": sum(1 for a in asset_risks if a["risk_level"] == "MODERATE"),
                "low": sum(1 for a in asset_risks if a["risk_level"] == "LOW"),
            },
            "forecast": forecast,
            "insights": insights,
            "top_risk_assets": asset_risks[:5],
        }
