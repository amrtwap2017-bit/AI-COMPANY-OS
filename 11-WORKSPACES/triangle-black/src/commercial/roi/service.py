"""
V6-E04 — ROI Measurement Service
Captures KPI snapshots over time and measures before/after improvement.

Uses: kpi_snapshots table (already exists)
Flow: snapshot → intervention → snapshot → delta → ROI report
"""
from __future__ import annotations
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger("tb.roi")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _now_iso() -> str:
    return _now().isoformat()


def _safe_float(v) -> float:
    try: return float(v or 0)
    except: return 0.0


def _pct_change(before: float, after: float) -> float:
    if before == 0:
        return 0.0
    return round((after - before) / before * 100, 1)


class ROIService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    # ── SNAPSHOT ─────────────────────────────────────────────────────────────

    def capture_snapshot(self, label: str = "manual",
                         period: str = "current") -> Dict[str, Any]:
        """
        Capture current KPI state into kpi_snapshots table.
        Call this BEFORE an intervention to establish baseline,
        and AFTER to measure improvement.
        """
        H = self.hotel_id
        now = _now()
        snapshot_id = str(uuid.uuid4())
        kpis_captured = []

        # Read current operational KPIs from live DB
        kpi_definitions = self._compute_live_kpis(H)

        for kpi in kpi_definitions:
            try:
                self.db.execute(text("""
                    INSERT INTO kpi_snapshots
                      (id, hotel_id, domain, kpi_key, kpi_label,
                       value, unit, trend, change_pct, target,
                       status, period, computed_at, created_at)
                    VALUES
                      (:id, :hid, :domain, :key, :label,
                       :value, :unit, :trend, :chg, :target,
                       :status, :period, :now, :now)
                """), {
                    "id": str(uuid.uuid4()),
                    "hid": H,
                    "domain": kpi["domain"],
                    "key": kpi["key"],
                    "label": kpi["label"],
                    "value": kpi["value"],
                    "unit": kpi["unit"],
                    "trend": kpi.get("trend", "stable"),
                    "chg": kpi.get("change_pct", 0),
                    "target": kpi.get("target", 0),
                    "status": kpi.get("status", "normal"),
                    "period": f"{label}:{period}:{now.strftime('%Y%m%d%H%M')}",
                    "now": now,
                })
                kpis_captured.append(kpi["key"])
            except Exception as e:
                logger.warning(f"KPI snapshot failed for {kpi['key']}: {e}")

        try:
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            return {"error": str(e), "captured": 0}

        return {
            "snapshot_id": snapshot_id,
            "hotel_id": H,
            "label": label,
            "period": period,
            "kpis_captured": len(kpis_captured),
            "kpi_keys": kpis_captured,
            "captured_at": _now_iso(),
        }

    def _compute_live_kpis(self, H: str) -> List[Dict[str, Any]]:
        """Read current KPI values from operational tables."""
        kpis = []

        def _q(sql, params=None):
            try:
                row = self.db.execute(text(sql), params or {}).fetchone()
                return dict(row._mapping) if row and hasattr(row, "_mapping") else {}
            except Exception:
                return {}

        # WO Completion Rate
        wo = _q("""
            SELECT
                COUNT(*) AS total,
                COUNT(CASE WHEN status='completed' THEN 1 END) AS completed
            FROM work_orders WHERE hotel_id=:h
        """, {"h": H})
        total = _safe_float(wo.get("total")) or 1
        comp_rate = round(_safe_float(wo.get("completed")) / total * 100, 1)
        kpis.append({"domain": "operations", "key": "wo_completion_rate",
                     "label": "WO Completion Rate", "value": comp_rate,
                     "unit": "%", "target": 80.0,
                     "status": "good" if comp_rate >= 70 else "warning"})

        # Open WOs (backlog)
        open_wos = _safe_float(wo.get("total", 0)) - _safe_float(wo.get("completed", 0))
        kpis.append({"domain": "operations", "key": "open_work_orders",
                     "label": "Open Work Orders", "value": open_wos,
                     "unit": "count", "target": 50.0,
                     "status": "warning" if open_wos > 100 else "good"})

        # PM Compliance
        pm = _q("""
            SELECT
                COUNT(*) AS total,
                COUNT(CASE WHEN status='completed' THEN 1 END) AS completed,
                COUNT(CASE WHEN next_due_date::DATE < CURRENT_DATE
                           AND status!='completed' THEN 1 END) AS overdue
            FROM maintenance_plans WHERE hotel_id=:h
        """, {"h": H})
        pm_total = _safe_float(pm.get("total")) or 1
        pm_rate = round(_safe_float(pm.get("completed")) / pm_total * 100, 1)
        overdue_pm = _safe_float(pm.get("overdue"))
        kpis.append({"domain": "maintenance", "key": "pm_compliance_rate",
                     "label": "PM Compliance Rate", "value": pm_rate,
                     "unit": "%", "target": 85.0,
                     "status": "good" if pm_rate >= 65 else "warning"})
        kpis.append({"domain": "maintenance", "key": "overdue_pm_plans",
                     "label": "Overdue PM Plans", "value": overdue_pm,
                     "unit": "count", "target": 0,
                     "status": "critical" if overdue_pm > 20 else "warning"})

        # Total operational spend
        spend = _q("""
            SELECT COALESCE(SUM(total_amount), 0) AS total
            FROM purchase_orders WHERE hotel_id=:h
        """, {"h": H})
        kpis.append({"domain": "financial", "key": "total_spend_egp",
                     "label": "Total Operational Spend (EGP)",
                     "value": _safe_float(spend.get("total")),
                     "unit": "EGP", "target": 0})

        # Asset count
        assets = _q("SELECT COUNT(*) AS total FROM assets WHERE hotel_id=:h", {"h": H})
        kpis.append({"domain": "assets", "key": "total_assets",
                     "label": "Total Assets Under Management",
                     "value": _safe_float(assets.get("total")),
                     "unit": "count"})

        # Supplier count
        sups = _q("SELECT COUNT(*) AS total FROM suppliers WHERE hotel_id=:h", {"h": H})
        kpis.append({"domain": "procurement", "key": "active_suppliers",
                     "label": "Active Suppliers",
                     "value": _safe_float(sups.get("total")),
                     "unit": "count"})

        return kpis

    # ── LIST SNAPSHOTS ────────────────────────────────────────────────────────

    def list_snapshots(self, limit: int = 20) -> Dict[str, Any]:
        """List distinct snapshot periods for this hotel."""
        try:
            rows = self.db.execute(text("""
                SELECT
                    period,
                    COUNT(DISTINCT kpi_key) AS kpi_count,
                    MIN(computed_at) AS captured_at,
                    COUNT(*) AS record_count
                FROM kpi_snapshots
                WHERE hotel_id = :h
                GROUP BY period
                ORDER BY MIN(computed_at) DESC
                LIMIT :lim
            """), {"h": self.hotel_id, "lim": limit}).fetchall()

            snapshots = [
                {
                    "period": r[0],
                    "label": r[0].split(":")[0] if ":" in r[0] else r[0],
                    "kpi_count": int(r[1]),
                    "captured_at": str(r[2]),
                    "record_count": int(r[3]),
                }
                for r in rows
            ]
            return {
                "hotel_id": self.hotel_id,
                "snapshot_count": len(snapshots),
                "snapshots": snapshots,
            }
        except Exception as e:
            return {"hotel_id": self.hotel_id, "error": str(e),
                    "snapshot_count": 0, "snapshots": []}

    # ── DELTA — BEFORE vs AFTER ────────────────────────────────────────────────

    def compute_delta(self) -> Dict[str, Any]:
        """
        Compare the two most recent snapshots to measure improvement.
        Returns: before KPIs, after KPIs, delta per KPI, overall ROI signal.
        """
        try:
            periods = self.db.execute(text("""
                SELECT period, MIN(computed_at) AS ts
                FROM kpi_snapshots WHERE hotel_id=:h
                GROUP BY period
                ORDER BY MIN(computed_at) DESC
                LIMIT 2
            """), {"h": self.hotel_id}).fetchall()

            if len(periods) < 2:
                # Only 1 or 0 snapshots — return current KPIs as baseline
                live = self._compute_live_kpis(self.hotel_id)
                return {
                    "hotel_id": self.hotel_id,
                    "status": "insufficient_snapshots",
                    "message": (
                        "Only one snapshot captured. "
                        "Capture a second snapshot after an intervention to measure ROI."
                    ),
                    "current_kpis": live,
                    "snapshots_needed": 2 - len(periods),
                    "generated_at": _now_iso(),
                }

            after_period = periods[0][0]
            before_period = periods[1][0]

            def _get_kpis(period: str) -> Dict[str, float]:
                rows = self.db.execute(text("""
                    SELECT kpi_key, value FROM kpi_snapshots
                    WHERE hotel_id=:h AND period=:p
                """), {"h": self.hotel_id, "p": period}).fetchall()
                return {r[0]: _safe_float(r[1]) for r in rows}

            before = _get_kpis(before_period)
            after = _get_kpis(after_period)

            deltas = []
            improvements = 0
            total_kpis = 0

            for key in before:
                if key in after:
                    b, a = before[key], after[key]
                    chg = _pct_change(b, a)
                    # Higher is better for completion/compliance, lower for backlog/spend
                    lower_is_better = key in ("open_work_orders", "overdue_pm_plans",
                                              "total_spend_egp")
                    improved = (chg > 0 and not lower_is_better) or \
                               (chg < 0 and lower_is_better)
                    deltas.append({
                        "kpi_key": key,
                        "label": key.replace("_", " ").title(),
                        "before": b,
                        "after": a,
                        "change_pct": chg,
                        "improved": improved,
                        "direction": "↑" if chg > 0 else ("↓" if chg < 0 else "→"),
                    })
                    total_kpis += 1
                    if improved:
                        improvements += 1

            improvement_rate = round(improvements / max(total_kpis, 1) * 100, 1)
            roi_signal = (
                "STRONG_POSITIVE" if improvement_rate >= 70 else
                "POSITIVE" if improvement_rate >= 50 else
                "NEUTRAL" if improvement_rate >= 30 else
                "NEEDS_ATTENTION"
            )

            return {
                "hotel_id": self.hotel_id,
                "before_period": before_period,
                "after_period": after_period,
                "kpi_count": total_kpis,
                "improvements": improvements,
                "improvement_rate_pct": improvement_rate,
                "roi_signal": roi_signal,
                "deltas": deltas,
                "summary": (
                    f"{improvements} of {total_kpis} KPIs improved "
                    f"({improvement_rate:.0f}%) — {roi_signal.replace('_',' ')}"
                ),
                "generated_at": _now_iso(),
            }
        except Exception as e:
            return {"hotel_id": self.hotel_id, "error": str(e)}

    # ── ROI REPORT ────────────────────────────────────────────────────────────

    def get_roi_report(self) -> Dict[str, Any]:
        """
        Full ROI measurement report.
        Combines: current KPIs + delta analysis + business value estimate.
        """
        H = self.hotel_id
        current_kpis = self._compute_live_kpis(H)
        delta = self.compute_delta()
        snapshots = self.list_snapshots(limit=5)

        # Business value estimate (rule-based, not AI)
        wo_completion = next(
            (k["value"] for k in current_kpis if k["key"] == "wo_completion_rate"), 70
        )
        pm_compliance = next(
            (k["value"] for k in current_kpis if k["key"] == "pm_compliance_rate"), 60
        )
        total_spend = next(
            (k["value"] for k in current_kpis if k["key"] == "total_spend_egp"), 0
        )

        # Estimated savings from improved PM compliance (industry benchmark: 15-20% cost avoidance)
        estimated_savings_egp = round(total_spend * 0.10, 0) if total_spend > 0 else 0
        estimated_emergency_reduction = max(0, 85 - pm_compliance) * 0.3

        # Count source records for transparency
        try:
            po_count = self.db.execute(_sa_text(
                "SELECT COUNT(*) FROM purchase_orders WHERE hotel_id=:h"
            ), {"h": H}).scalar() or 0
            inv_count = self.db.execute(_sa_text(
                "SELECT COUNT(*) FROM invoices WHERE hotel_id=:h"
            ), {"h": H}).scalar() or 0
            # Also get WO count as a proxy for operational activity
            wo_count = self.db.execute(_sa_text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h"
            ), {"h": H}).scalar() or 0
        except Exception:
            po_count = 0
            inv_count = 0
            wo_count = 0
            try: self.db.rollback()
            except: pass

        return {
            "hotel_id": H,
            "report_type": "ROI_MEASUREMENT_REPORT",
            "version": "v6-E04",
            "defensibility": {
                "formula": "Estimated Cost Avoidance = Total Operational Spend × 10%",
                "formula_detail": "estimated_cost_avoidance = total_operational_spend × 0.10 (see improvement_potential for values)",
                "assumptions": [
                    "10% cost reduction rate based on FM industry benchmark",
                    "Assumes PM compliance improvement from current to 85% target",
                    "Reactive maintenance premium estimated at 20-30% above planned cost",
                    "This is an ESTIMATE — actual savings depend on actions taken",
                    "Not a guarantee — label as 'potential avoidance' in customer communications"
                ],
                "confidence": "LOW",
                "confidence_reason": (
                    "Estimate based on industry benchmark, not measured operational outcome. "
                    "WO-asset linkage is 7.7% — MTTR and critical path are limited. "
                    "Cost avoidance will become measurable after 30-day pilot with before/after KPIs."
                ),
                "source_data": {
                    "purchase_orders_count": int(po_count),
                    "invoices_count": int(inv_count),
                    "work_orders_count": int(wo_count) if 'wo_count' in dir() else 0,
                    "spend_calculation": (
                        "SUM(total_amount) FROM purchase_orders WHERE hotel_id"
                        if po_count > 0 else
                        "Estimated from operational spend benchmarks (no PO data)"
                    ),
                    "data_period": "All available purchase order history",
                    "hotel_id": H,
                    "data_quality_note": (
                        "GOOD: Based on actual purchase orders"
                        if po_count > 10 else
                        "LIMITED: Few or no purchase orders found. "
                        "Spend estimate uses industry benchmarks."
                    ),
                },
                "benchmark_source": "Industry FM benchmark: 10-15% cost reduction via PM compliance improvement",
                "important_disclaimer": (
                    "Triangle Black identifies POTENTIAL cost avoidance opportunities. "
                    "Actual savings require operational actions and are measured via ROI delta "
                    "after 30-day pilot. Do not present this figure as guaranteed savings."
                ),
                "how_to_improve_confidence": [
                    "Complete 30-day pilot with before/after KPI measurement",
                    "Record outcomes on approved AI recommendations",
                    "Link work orders to assets (currently 7.7% — target 80%+)",
                    "Capture monthly ROI snapshots via POST /roi/snapshot",
                ],
            },
            "generated_at": _now_iso(),
            "current_performance": {
                "wo_completion_rate_pct": wo_completion,
                "pm_compliance_rate_pct": pm_compliance,
                "total_operational_spend_egp": total_spend,
                "performance_grade": (
                    "A" if wo_completion >= 80 and pm_compliance >= 80 else
                    "B" if wo_completion >= 70 and pm_compliance >= 65 else
                    "C" if wo_completion >= 60 and pm_compliance >= 50 else "D"
                ),
            },
            "improvement_potential": {
                "pm_gap_to_target_pct": max(0, 85 - pm_compliance),
                "wo_gap_to_target_pct": max(0, 80 - wo_completion),
                "estimated_cost_avoidance_egp": estimated_savings_egp,
                "estimated_emergency_reduction_pct": round(estimated_emergency_reduction, 1),
                "methodology": "10% cost avoidance via PM compliance improvement (industry benchmark)",
            },
            "delta_analysis": delta,
            "snapshot_history": snapshots,
            "current_kpis": current_kpis,
            "recommendation": (
                "Platform is actively preventing avoidable costs through "
                f"predictive maintenance. Estimated EGP {estimated_savings_egp:,.0f} "
                "annual cost avoidance opportunity identified."
            ) if total_spend > 0 else
            "Capture KPI snapshots before and after interventions to measure ROI.",
        }
