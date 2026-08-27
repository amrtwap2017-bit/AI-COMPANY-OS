"""
Predictive Maintenance Engine — Triangle Black A-071
Rule-based predictive scoring (ML later).

Answers: "Which assets are most likely to need attention soon?"

Formula (verified using real DB columns):
  score = (failure_freq * 0.40) + (pm_gap_ratio * 0.35) + (age_ratio * 0.25)

Where:
  failure_freq  = recent_failures_90d / max(1, total_failures) * 100
  pm_gap_ratio  = days_since_last_maint / expected_freq_days * 100
  age_ratio     = asset_age_years / 10 * 100 (capped at 100)

All from: work_orders + maintenance_plans + assets (verified columns)
"""
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import text


FREQ_DAYS = {
    "weekly": 7, "monthly": 30, "quarterly": 90,
    "biannual": 180, "annual": 365, "annually": 365,
}


class PredictiveEngineService:
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

    def asset_risk_predictions(self, limit: int = 30) -> list:
        """Predict which assets are most likely to need attention."""
        rows = self._q("""
            SELECT
                a.id, a.name, a.category, a.criticality,
                a.last_maintenance_date, a.next_maintenance_date,
                a.installation_date, a.warranty_expiry,
                COUNT(wo.id) AS total_failures,
                COUNT(wo.id) FILTER (
                    WHERE wo.created_at >= NOW() - INTERVAL '90 days'
                ) AS recent_failures_90d,
                COUNT(wo.id) FILTER (
                    WHERE LOWER(wo.priority) IN ('critical','emergency')
                ) AS critical_failures,
                mp.frequency AS pm_frequency,
                mp.next_due_date,
                EXTRACT(EPOCH FROM (NOW() - COALESCE(a.last_maintenance_date, a.created_at))) / 86400
                    AS days_since_maintenance
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :h AND wo.deleted_at IS NULL
            LEFT JOIN maintenance_plans mp ON mp.asset_node_id = a.id
                AND mp.hotel_id = :h AND LOWER(mp.status) = 'active'
            WHERE a.hotel_id = :h AND a.deleted_at IS NULL
            GROUP BY a.id, a.name, a.category, a.criticality,
                     a.last_maintenance_date, a.next_maintenance_date,
                     a.installation_date, a.warranty_expiry,
                     mp.frequency, mp.next_due_date
            ORDER BY recent_failures_90d DESC, critical_failures DESC
            LIMIT :lim
        """, {"h": self.hid, "lim": limit})

        today = date.today()
        result = []

        for r in rows:
            d = dict(r._mapping)
            total_fail = d.get("total_failures", 0) or 0
            recent = d.get("recent_failures_90d", 0) or 0
            critical = d.get("critical_failures", 0) or 0
            days_since = float(d.get("days_since_maintenance") or 365)
            criticality = (d.get("criticality") or "medium").lower()
            freq_str = (d.get("pm_frequency") or "monthly").lower()
            freq_days = FREQ_DAYS.get(freq_str, 30)

            # Factor 1: Recent failure frequency (0-100)
            failure_factor = min(100, recent * 25 + critical * 15)

            # Factor 2: PM gap ratio (0-100)
            pm_gap = min(100, round(days_since / max(freq_days, 1) * 100, 1))

            # Factor 3: Asset age ratio (0-100)
            install_date = d.get("installation_date")
            age_years = 3  # default
            if install_date:
                try:
                    if isinstance(install_date, (date, datetime)):
                        age_years = (today - install_date).days / 365
                    else:
                        age_years = (today - date.fromisoformat(str(install_date)[:10])).days / 365
                except:
                    pass
            age_factor = min(100, round(age_years / 10 * 100, 1))

            # Criticality multiplier
            crit_mult = {"critical": 1.5, "high": 1.2, "medium": 1.0, "low": 0.7}.get(criticality, 1.0)

            # Composite predictive score
            raw = (failure_factor * 0.40 + pm_gap * 0.35 + age_factor * 0.25) * crit_mult
            pred_score = min(100, round(raw, 1))

            risk_level = (
                "CRITICAL" if pred_score >= 80
                else "HIGH" if pred_score >= 60
                else "MODERATE" if pred_score >= 40
                else "LOW"
            )

            # Estimated days until intervention needed
            days_to_action = max(0, round(freq_days - days_since))

            result.append({
                "asset_id": d["id"],
                "asset_name": d.get("name", ""),
                "category": d.get("category", ""),
                "criticality": d.get("criticality", ""),
                "predictive_score": pred_score,
                "risk_level": risk_level,
                "days_to_recommended_action": days_to_action,
                "days_since_maintenance": round(days_since, 0),
                "recent_failures_90d": recent,
                "critical_failures": critical,
                "pm_frequency": freq_str,
                "recommendation": (
                    "IMMEDIATE_ACTION" if pred_score >= 80
                    else "SCHEDULE_SOON" if pred_score >= 60
                    else "MONITOR" if pred_score >= 40
                    else "MAINTAIN_SCHEDULE"
                ),
                "factors": {
                    "failure_factor": round(failure_factor, 1),
                    "pm_gap_factor": round(pm_gap, 1),
                    "age_factor": round(age_factor, 1),
                }
            })

        return sorted(result, key=lambda x: x["predictive_score"], reverse=True)

    def summary(self) -> dict:
        """Predictive maintenance intelligence summary."""
        assets = self.asset_risk_predictions(limit=200)

        if not assets:
            return {
                "hotel_id": self.hid,
                "generated_at": datetime.utcnow().isoformat(),
                "total_assessed": 0,
                "risk_distribution": {},
                "immediate_action": [],
                "insights": [],
            }

        risk_dist = {}
        for a in assets:
            risk_dist[a["risk_level"]] = risk_dist.get(a["risk_level"], 0) + 1

        immediate = [a for a in assets if a["recommendation"] == "IMMEDIATE_ACTION"][:5]
        schedule_soon = [a for a in assets if a["recommendation"] == "SCHEDULE_SOON"][:5]

        avg_score = round(sum(a["predictive_score"] for a in assets) / max(len(assets), 1), 1)

        insights = []
        if immediate:
            insights.append({
                "type": "IMMEDIATE_ACTION_NEEDED",
                "severity": "CRITICAL",
                "message": f"{len(immediate)} assets need immediate maintenance intervention"
            })
        if risk_dist.get("HIGH", 0) > 5:
            insights.append({
                "type": "HIGH_RISK_ASSETS",
                "severity": "HIGH",
                "message": f"{risk_dist.get('HIGH', 0)} assets at high predicted failure risk"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "total_assessed": len(assets),
            "avg_predictive_score": avg_score,
            "risk_distribution": risk_dist,
            "immediate_action": immediate,
            "schedule_soon": schedule_soon,
            "insights": insights,
            "top_risk_assets": assets[:5],
        }
