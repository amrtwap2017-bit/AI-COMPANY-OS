"""
V10-006: Data Lineage Service
Every intelligence metric must expose: value, confidence, sample_size, coverage, limitations.
"""
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class Confidence(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    VERY_LOW = "VERY_LOW"
    INSUFFICIENT = "INSUFFICIENT"


@dataclass
class MetricLineage:
    """Standard lineage wrapper for every intelligence metric."""
    metric_name: str
    value: Any
    unit: Optional[str]
    confidence: Confidence
    sample_size: int
    total_population: int
    coverage_pct: float
    data_sources: List[str]
    limitations: List[str]
    calculation_method: str
    last_calculated: str
    improvement_actions: List[str]

    def to_dict(self) -> Dict:
        d = asdict(self)
        d["confidence"] = self.confidence.value
        return d

    @property
    def is_reliable(self) -> bool:
        return self.coverage_pct >= 70 and self.confidence in [Confidence.HIGH, Confidence.MEDIUM]


def wo_asset_lineage(wo_total: int, wo_linked: int, mttr_value: Optional[float]) -> MetricLineage:
    """Lineage for WO→Asset linkage metric."""
    coverage = round(wo_linked / max(wo_total, 1) * 100, 1)
    if coverage >= 80:
        confidence = Confidence.HIGH
    elif coverage >= 50:
        confidence = Confidence.MEDIUM
    elif coverage >= 20:
        confidence = Confidence.LOW
    elif coverage >= 5:
        confidence = Confidence.VERY_LOW
    else:
        confidence = Confidence.INSUFFICIENT

    limitations = []
    if coverage < 80:
        limitations.append(f"Only {coverage}% of WOs linked to assets — intelligence is partial")
    if coverage < 20:
        limitations.append("MTTR, critical path, and repeat failure detection are unreliable")
    if coverage < 5:
        limitations.append("Asset-based intelligence not available — link WOs to assets first")

    return MetricLineage(
        metric_name="WO→Asset Linkage",
        value=coverage,
        unit="%",
        confidence=confidence,
        sample_size=wo_linked,
        total_population=wo_total,
        coverage_pct=coverage,
        data_sources=["work_orders", "assets"],
        limitations=limitations,
        calculation_method="COUNT(wo.asset_id IS NOT NULL) / COUNT(*) * 100",
        last_calculated=__import__("datetime").datetime.utcnow().isoformat(),
        improvement_actions=[
            "Add asset selector to corrective WO creation form (V10-006)",
            "Add asset field to SR→WO conversion (V10-007)",
            "Import asset register during onboarding",
        ]
    )


def mttr_lineage(completed_wos: int, asset_linked_wos: int, mttr_hours: Optional[float]) -> MetricLineage:
    """Lineage for MTTR metric — only reliable when WO→Asset linkage is high."""
    coverage = round(asset_linked_wos / max(completed_wos, 1) * 100, 1)

    if coverage >= 80:
        confidence = Confidence.HIGH
    elif coverage >= 50:
        confidence = Confidence.MEDIUM
    elif coverage >= 20:
        confidence = Confidence.LOW
    else:
        confidence = Confidence.VERY_LOW

    limitations = []
    if coverage < 80:
        limitations.append(f"MTTR calculated from only {coverage}% of completed WOs")
    if coverage < 20:
        limitations.append("MTTR value should not be used for operational decisions")

    return MetricLineage(
        metric_name="MTTR",
        value=mttr_hours,
        unit="hours",
        confidence=confidence,
        sample_size=asset_linked_wos,
        total_population=completed_wos,
        coverage_pct=coverage,
        data_sources=["work_orders", "assets"],
        limitations=limitations,
        calculation_method="AVG(completed_at - created_at) WHERE asset_id IS NOT NULL",
        last_calculated=__import__("datetime").datetime.utcnow().isoformat(),
        improvement_actions=[
            "Increase WO→Asset linkage to >80% for reliable MTTR",
            "Link historical WOs to assets via bulk linkage tool",
        ]
    )


def pm_compliance_lineage(pm_total: int, pm_completed: int, pm_linked: int) -> MetricLineage:
    """Lineage for PM compliance metric."""
    compliance = round(pm_completed / max(pm_total, 1) * 100, 1)
    asset_coverage = round(pm_linked / max(pm_total, 1) * 100, 1)

    if asset_coverage >= 80 and compliance >= 0:
        confidence = Confidence.HIGH
    elif asset_coverage >= 50:
        confidence = Confidence.MEDIUM
    else:
        confidence = Confidence.LOW

    return MetricLineage(
        metric_name="PM Compliance",
        value=compliance,
        unit="%",
        confidence=confidence,
        sample_size=pm_completed,
        total_population=pm_total,
        coverage_pct=asset_coverage,
        data_sources=["maintenance_plans", "work_orders"],
        limitations=[
            f"PM→Asset linkage is {asset_coverage}% — plans without assets excluded from analysis"
        ] if asset_coverage < 80 else [],
        calculation_method="COUNT(pm completed on time) / COUNT(pm total) * 100",
        last_calculated=__import__("datetime").datetime.utcnow().isoformat(),
        improvement_actions=[
            "Link all PM plans to assets (currently 73.4%)",
            "Complete overdue PM plans",
        ]
    )
