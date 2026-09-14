"""
TRIANGLE BLACK — Canonical Metric Registry
ONE DEFINITION. ONE CALCULATION. MANY CONSUMERS.

Rule: Every dashboard, report, pilot, AI, and API
      must consume metrics from this registry.
      No independent metric recalculation allowed.
"""
from __future__ import annotations
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class MetricDefinition:
    """A canonical metric definition with full lineage."""
    def __init__(
        self,
        metric_id: str,
        name: str,
        definition: str,
        formula: str,
        source_tables: list,
        scope: str = "hotel",
        time_window: Optional[str] = None,
        owner: str = "platform",
    ):
        self.metric_id = metric_id
        self.name = name
        self.definition = definition
        self.formula = formula
        self.source_tables = source_tables
        self.scope = scope
        self.time_window = time_window
        self.owner = owner


# ─── CANONICAL METRIC DEFINITIONS ───────────────────────────────────────────

METRIC_DEFINITIONS = {
    "wo_asset_linkage": MetricDefinition(
        metric_id="wo_asset_linkage",
        name="Work Order → Asset Linkage %",
        definition="Percentage of work orders linked to a specific asset",
        formula="COUNT(wo.asset_id IS NOT NULL) / COUNT(*) * 100",
        source_tables=["work_orders"],
        owner="operations",
    ),
    "wo_classification_rate": MetricDefinition(
        metric_id="wo_classification_rate",
        name="Work Order Classification Rate %",
        definition="Percentage of WOs either asset-linked OR classified with non_asset_reason",
        formula="COUNT(asset_id IS NOT NULL OR non_asset_reason IS NOT NULL) / COUNT(*) * 100",
        source_tables=["work_orders"],
        owner="operations",
    ),
    "pm_asset_linkage": MetricDefinition(
        metric_id="pm_asset_linkage",
        name="PM Plan → Asset Linkage %",
        definition="Percentage of active PM plans linked to a specific asset",
        formula="COUNT(asset_node_id IS NOT NULL) / COUNT(*) * 100",
        source_tables=["maintenance_plans"],
        owner="maintenance",
    ),
    "pm_compliance": MetricDefinition(
        metric_id="pm_compliance",
        name="PM Compliance %",
        definition="Percentage of active PM plans that are NOT overdue",
        formula="(COUNT(active) - COUNT(active AND next_due_date < TODAY)) / COUNT(active) * 100",
        source_tables=["maintenance_plans"],
        owner="maintenance",
    ),
    "pm_overdue_count": MetricDefinition(
        metric_id="pm_overdue_count",
        name="Overdue PM Plans",
        definition="Count of active PM plans with next_due_date < today",
        formula="COUNT(*) WHERE status='active' AND next_due_date < CURRENT_DATE",
        source_tables=["maintenance_plans"],
        owner="maintenance",
    ),
    "rec_acceptance_rate": MetricDefinition(
        metric_id="rec_acceptance_rate",
        name="Recommendation Acceptance Rate %",
        definition="Percentage of actionable recommendations that were approved",
        formula="COUNT(approved) / (COUNT(approved) + COUNT(pending)) * 100",
        source_tables=["recommendations"],
        owner="intelligence",
    ),
    "rec_outcome_rate": MetricDefinition(
        metric_id="rec_outcome_rate",
        name="Recommendation Outcome Rate %",
        definition="Percentage of approved recommendations with recorded outcomes",
        formula="COUNT(outcome IS NOT NULL) / COUNT(approved OR closed) * 100",
        source_tables=["recommendations"],
        owner="intelligence",
    ),
    "critical_wo_count": MetricDefinition(
        metric_id="critical_wo_count",
        name="Open Critical Work Orders",
        definition="Work orders with priority=critical and status not completed or cancelled",
        formula="COUNT(*) WHERE priority='critical' AND status NOT IN ('completed','cancelled')",
        source_tables=["work_orders"],
        owner="operations",
    ),
}


class MetricService:
    """
    THE canonical metric calculation service.
    All dashboards, reports, pilots, and AI must use this.
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def _q(self, sql: str, params: dict = None) -> Any:
        try:
            return self.db.execute(text(sql), params or {}).scalar() or 0
        except Exception:
            return 0

    def wo_asset_linkage(self) -> Dict[str, Any]:
        h = self.hotel_id
        total = self._q("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h", {"h":h})
        linked = self._q("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NOT NULL", {"h":h})
        classified = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NULL AND non_asset_reason IS NOT NULL",
            {"h":h}
        )
        pct = round(linked / max(total, 1) * 100, 2)
        total_classified_pct = round((linked + classified) / max(total, 1) * 100, 1)
        confidence = "HIGH" if pct >= 70 else "MEDIUM" if pct >= 40 else "LOW" if pct >= 20 else "VERY_LOW"
        return {
            "metric_id": "wo_asset_linkage",
            "value": pct,
            "population": int(total),
            "sample": int(linked),
            "classified": int(classified),
            "total_classified_pct": total_classified_pct,
            "confidence": confidence,
            "limitation": "Low linkage reduces intelligence reliability" if pct < 30 else None,
            "calculated_at": datetime.utcnow().isoformat(),
        }

    def pm_asset_linkage(self) -> Dict[str, Any]:
        h = self.hotel_id
        total = self._q("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h", {"h":h})
        linked = self._q("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND asset_node_id IS NOT NULL", {"h":h})
        pct = round(linked / max(total, 1) * 100, 2)
        confidence = "HIGH" if pct >= 70 else "MEDIUM" if pct >= 40 else "LOW"
        return {
            "metric_id": "pm_asset_linkage",
            "value": pct,
            "population": int(total),
            "sample": int(linked),
            "confidence": confidence,
            "calculated_at": datetime.utcnow().isoformat(),
        }

    def pm_compliance(self) -> Dict[str, Any]:
        h = self.hotel_id
        active = self._q("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND status='active'", {"h":h})
        overdue = self._q(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND status='active' AND next_due_date < CURRENT_DATE",
            {"h":h}
        )
        pct = round((active - overdue) / max(active, 1) * 100, 1)
        return {
            "metric_id": "pm_compliance",
            "value": pct,
            "active": int(active),
            "overdue": int(overdue),
            "confidence": "HIGH" if pct > 0 else "INSUFFICIENT",
            "calculated_at": datetime.utcnow().isoformat(),
        }

    def rec_acceptance_rate(self) -> Dict[str, Any]:
        h = self.hotel_id
        approved = self._q("SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='approved'", {"h":h})
        pending = self._q("SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='pending'", {"h":h})
        actionable = approved + pending
        pct = round(approved / max(actionable, 1) * 100, 1)
        return {
            "metric_id": "rec_acceptance_rate",
            "value": pct,
            "approved": int(approved),
            "pending": int(pending),
            "confidence": "HIGH" if actionable > 10 else "LOW",
            "calculated_at": datetime.utcnow().isoformat(),
        }

    def rec_outcome_rate(self) -> Dict[str, Any]:
        h = self.hotel_id
        acted = self._q(
            "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status IN ('approved','closed')",
            {"h":h}
        )
        with_outcome = self._q(
            "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND outcome IS NOT NULL",
            {"h":h}
        )
        pct = round(with_outcome / max(acted, 1) * 100, 1)
        total_roi = self._q(
            "SELECT COALESCE(SUM(roi_impact),0) FROM recommendations WHERE hotel_id=:h AND outcome='improved'",
            {"h":h}
        )
        return {
            "metric_id": "rec_outcome_rate",
            "value": pct,
            "acted_on": int(acted),
            "with_outcome": int(with_outcome),
            "verified_roi_egp": float(total_roi),
            "roi_confidence": "VERIFIED" if with_outcome > 0 else "NOT_YET_MEASURED",
            "confidence": "HIGH" if with_outcome > 10 else "LOW" if with_outcome > 0 else "INSUFFICIENT",
            "calculated_at": datetime.utcnow().isoformat(),
        }

    def critical_wo_count(self) -> Dict[str, Any]:
        h = self.hotel_id
        count = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND priority='critical' AND status NOT IN ('completed','cancelled')",
            {"h":h}
        )
        unassigned = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND priority='critical' AND status='open' AND technician_id IS NULL",
            {"h":h}
        )
        return {
            "metric_id": "critical_wo_count",
            "value": int(count),
            "unassigned": int(unassigned),
            "confidence": "HIGH",
            "risk": "P0" if count > 100 else "P1" if count > 20 else "P2",
            "calculated_at": datetime.utcnow().isoformat(),
        }

    def get_all_metrics(self) -> Dict[str, Any]:
        """Get all canonical metrics in one call."""
        return {
            "hotel_id": self.hotel_id,
            "calculated_at": datetime.utcnow().isoformat(),
            "metrics": {
                "wo_asset_linkage": self.wo_asset_linkage(),
                "pm_asset_linkage": self.pm_asset_linkage(),
                "pm_compliance": self.pm_compliance(),
                "rec_acceptance_rate": self.rec_acceptance_rate(),
                "rec_outcome_rate": self.rec_outcome_rate(),
                "critical_wo_count": self.critical_wo_count(),
            }
        }
