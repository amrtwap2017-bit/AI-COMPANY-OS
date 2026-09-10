"""
V10-011: Pilot Baseline KPI Capture Service
Captures Day 0 state before pilot interventions.
Every metric includes data lineage from V10-006.
"""
from __future__ import annotations
from typing import Dict, Any, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import text


class PilotBaselineService:
    """
    Captures and compares operational KPIs for 30-day pilot measurement.
    
    Usage:
      baseline = PilotBaselineService(db, hotel_id)
      snapshot = baseline.capture()  # Day 0
      comparison = baseline.compare(previous_snapshot)  # Week 1-4
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def _q(self, sql: str, params: dict = None) -> Any:
        try:
            return self.db.execute(text(sql), params or {}).scalar() or 0
        except Exception:
            return 0

    def capture_baseline(self) -> Dict[str, Any]:
        """
        Capture the complete operational baseline.
        Called on Day 0 of a pilot.
        Returns all KPIs with confidence metadata.
        """
        h = self.hotel_id
        now = datetime.utcnow().isoformat()

        # Work Orders
        wo_total = self._q("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h", {"h": h})
        wo_open = self._q("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND status='open'", {"h": h})
        wo_critical = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h "
            "AND priority='critical' AND status NOT IN ('completed','cancelled')", {"h": h}
        )
        wo_unassigned = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h "
            "AND status='open' AND technician_id IS NULL", {"h": h}
        )
        wo_linked = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NOT NULL", {"h": h}
        )
        wo_completed_30d = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND status='completed' "
            "AND completed_at > NOW() - INTERVAL '30 days'", {"h": h}
        )

        # PM Plans
        pm_total = self._q("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h", {"h": h})
        pm_active = self._q(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND status='active'", {"h": h}
        )
        pm_overdue = self._q(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h "
            "AND status='active' AND next_due_date < CURRENT_DATE", {"h": h}
        )
        pm_linked = self._q(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND asset_node_id IS NOT NULL", {"h": h}
        )

        # Assets
        assets_total = self._q(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:h AND deleted_at IS NULL", {"h": h}
        )

        # MTTR (only for asset-linked WOs)
        mttr_result = self.db.execute(text("""
            SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600)
            FROM work_orders
            WHERE hotel_id=:h AND status='completed' AND asset_id IS NOT NULL
            AND completed_at IS NOT NULL AND completed_at > created_at
            AND completed_at > NOW() - INTERVAL '90 days'
        """), {"h": h}).scalar()
        mttr_hours = round(float(mttr_result), 1) if mttr_result else None

        # Suppliers
        suppliers_total = self._q("SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h", {"h": h})

        # Recommendations
        recs_pending = self._q(
            "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='pending'", {"h": h}
        )
        recs_approved = self._q(
            "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='approved'", {"h": h}
        )
        recs_total = self._q("SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h", {"h": h})

        # Calculate derived metrics
        wo_asset_linkage_pct = round(wo_linked / max(wo_total, 1) * 100, 1)
        pm_compliance_pct = round((pm_active - pm_overdue) / max(pm_active, 1) * 100, 1)
        pm_asset_linkage_pct = round(pm_linked / max(pm_total, 1) * 100, 1)
        ai_acceptance_pct = round(recs_approved / max(recs_total, 1) * 100, 1)

        # Data confidence
        wo_confidence = (
            "HIGH" if wo_asset_linkage_pct >= 80 else
            "MEDIUM" if wo_asset_linkage_pct >= 50 else
            "LOW" if wo_asset_linkage_pct >= 20 else "VERY_LOW"
        )

        return {
            "hotel_id": h,
            "captured_at": now,
            "capture_date": date.today().isoformat(),
            "snapshot_type": "baseline",

            # Work Orders
            "work_orders": {
                "total": int(wo_total),
                "open": int(wo_open),
                "critical_open": int(wo_critical),
                "unassigned": int(wo_unassigned),
                "asset_linked": int(wo_linked),
                "completed_last_30d": int(wo_completed_30d),
                "asset_linkage_pct": wo_asset_linkage_pct,
            },

            # Maintenance
            "maintenance": {
                "pm_total": int(pm_total),
                "pm_active": int(pm_active),
                "pm_overdue": int(pm_overdue),
                "pm_asset_linked": int(pm_linked),
                "pm_compliance_pct": pm_compliance_pct,
                "pm_asset_linkage_pct": pm_asset_linkage_pct,
            },

            # Performance
            "performance": {
                "mttr_hours": mttr_hours,
                "mttr_confidence": wo_confidence,
                "mttr_based_on_wos": int(wo_linked),
                "mttr_total_wos": int(wo_total),
            },

            # Assets
            "assets": {
                "total": int(assets_total),
                "suppliers": int(suppliers_total),
            },

            # Intelligence
            "intelligence": {
                "recommendations_pending": int(recs_pending),
                "recommendations_approved": int(recs_approved),
                "ai_acceptance_pct": ai_acceptance_pct,
            },

            # Overall data quality
            "data_quality": {
                "wo_asset_linkage_pct": wo_asset_linkage_pct,
                "pm_asset_linkage_pct": pm_asset_linkage_pct,
                "intelligence_confidence": wo_confidence,
                "primary_gap": (
                    "WO→Asset linkage too low for reliable intelligence"
                    if wo_asset_linkage_pct < 30 else
                    "Data quality acceptable for pilot measurement"
                ),
            },

            # Summary scores for pilot reporting
            "pilot_scores": {
                "operational_control": self._score_operational_control(
                    wo_critical, wo_unassigned, pm_overdue, pm_active
                ),
                "data_quality_score": self._score_data_quality(
                    wo_asset_linkage_pct, pm_asset_linkage_pct
                ),
                "intelligence_score": self._score_intelligence(ai_acceptance_pct, recs_pending),
            }
        }

    def compare_snapshots(self, baseline: Dict, current: Dict) -> Dict[str, Any]:
        """
        Compare two snapshots to show pilot progress and ROI.
        baseline = Day 0 snapshot
        current = Week N snapshot
        """
        def delta(current_val, baseline_val, higher_is_better=True):
            if baseline_val == 0:
                return {"value": current_val, "delta": 0, "delta_pct": 0, "improved": None}
            change = current_val - baseline_val
            change_pct = round(change / baseline_val * 100, 1)
            improved = (change > 0) if higher_is_better else (change < 0)
            return {
                "baseline": baseline_val,
                "current": current_val,
                "delta": round(change, 1),
                "delta_pct": change_pct,
                "improved": improved
            }

        b_wo = baseline.get("work_orders", {})
        c_wo = current.get("work_orders", {})
        b_maint = baseline.get("maintenance", {})
        c_maint = current.get("maintenance", {})
        b_perf = baseline.get("performance", {})
        c_perf = current.get("performance", {})

        # Calculate ROI metrics
        reduced_critical = b_wo.get("critical_open", 0) - c_wo.get("critical_open", 0)
        reduced_unassigned = b_wo.get("unassigned", 0) - c_wo.get("unassigned", 0)
        reduced_overdue_pm = b_maint.get("pm_overdue", 0) - c_maint.get("pm_overdue", 0)
        improved_linkage = c_wo.get("asset_linkage_pct", 0) - b_wo.get("asset_linkage_pct", 0)

        return {
            "hotel_id": self.hotel_id,
            "baseline_date": baseline.get("capture_date"),
            "current_date": current.get("capture_date"),
            "days_elapsed": self._days_between(
                baseline.get("capture_date"), current.get("capture_date")
            ),

            "improvements": {
                "critical_wos_reduced": int(max(reduced_critical, 0)),
                "unassigned_wos_reduced": int(max(reduced_unassigned, 0)),
                "overdue_pm_reduced": int(max(reduced_overdue_pm, 0)),
                "asset_linkage_improved_pct": round(improved_linkage, 1),
            },

            "metrics": {
                "critical_open_wos": delta(c_wo.get("critical_open", 0),
                                           b_wo.get("critical_open", 0), higher_is_better=False),
                "unassigned_wos": delta(c_wo.get("unassigned", 0),
                                        b_wo.get("unassigned", 0), higher_is_better=False),
                "pm_overdue": delta(c_maint.get("pm_overdue", 0),
                                    b_maint.get("pm_overdue", 0), higher_is_better=False),
                "pm_compliance": delta(c_maint.get("pm_compliance_pct", 0),
                                       b_maint.get("pm_compliance_pct", 0), higher_is_better=True),
                "wo_asset_linkage": delta(c_wo.get("asset_linkage_pct", 0),
                                          b_wo.get("asset_linkage_pct", 0), higher_is_better=True),
                "mttr_hours": delta(c_perf.get("mttr_hours") or 0,
                                    b_perf.get("mttr_hours") or 0, higher_is_better=False),
            },

            "roi_evidence": {
                "critical_wos_addressed": int(max(reduced_critical, 0)),
                "pm_compliance_improvement": round(
                    c_maint.get("pm_compliance_pct", 0) - b_maint.get("pm_compliance_pct", 0), 1
                ),
                "data_quality_improvement": round(improved_linkage, 1),
                "summary": self._roi_summary(reduced_critical, reduced_overdue_pm, improved_linkage),
            }
        }

    def _days_between(self, date1_str: Optional[str], date2_str: Optional[str]) -> int:
        if not date1_str or not date2_str:
            return 0
        try:
            d1 = date.fromisoformat(date1_str)
            d2 = date.fromisoformat(date2_str)
            return (d2 - d1).days
        except Exception:
            return 0

    def _score_operational_control(self, critical, unassigned, pm_overdue, pm_active) -> int:
        """Score 0-100 for operational control."""
        score = 100
        if critical > 100: score -= 30
        elif critical > 50: score -= 15
        elif critical > 10: score -= 5
        if unassigned > 200: score -= 25
        elif unassigned > 100: score -= 10
        pm_overdue_pct = pm_overdue / max(pm_active, 1) * 100
        if pm_overdue_pct > 50: score -= 30
        elif pm_overdue_pct > 25: score -= 15
        elif pm_overdue_pct > 10: score -= 5
        return max(0, min(100, score))

    def _score_data_quality(self, wo_linkage, pm_linkage) -> int:
        """Score 0-100 for data quality."""
        return int((wo_linkage * 0.6 + pm_linkage * 0.4))

    def _score_intelligence(self, acceptance_pct, pending) -> int:
        """Score 0-100 for AI intelligence quality."""
        score = min(acceptance_pct * 2, 50)  # Max 50 from acceptance
        if pending < 100: score += 50
        elif pending < 500: score += 30
        elif pending < 1000: score += 15
        return int(min(100, score))

    def _roi_summary(self, critical_reduced, pm_reduced, linkage_improved) -> str:
        items = []
        if critical_reduced > 0:
            items.append(f"{critical_reduced} critical WOs addressed")
        if pm_reduced > 0:
            items.append(f"{pm_reduced} overdue PM plans resolved")
        if linkage_improved > 5:
            items.append(f"WO→Asset linkage improved by {round(linkage_improved, 1)}%")
        if not items:
            return "Pilot in progress — metrics will improve as team adopts the platform"
        return "Improvement: " + " | ".join(items)
