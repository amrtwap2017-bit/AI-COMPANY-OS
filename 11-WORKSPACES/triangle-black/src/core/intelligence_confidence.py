"""
V8-S02 — Intelligence Confidence Layer
Every intelligence claim must state its reliability.

Usage:
    from src.core.intelligence_confidence import add_confidence

    return add_confidence(
        data=your_response,
        record_count=actual_records,
        total_possible=total_records,
        metric_name="MTTR",
    )
"""
from __future__ import annotations
from typing import Any, Optional


CONFIDENCE_THRESHOLDS = {
    "HIGH":   {"min_coverage": 0.80, "min_records": 100},
    "MEDIUM": {"min_coverage": 0.50, "min_records": 30},
    "LOW":    {"min_coverage": 0.20, "min_records": 10},
}


def calculate_confidence(
    record_count: int,
    total_possible: int,
    minimum_records: int = 10,
) -> tuple[str, float]:
    """Returns (confidence_level, coverage_pct)."""
    if total_possible == 0:
        return "UNKNOWN", 0.0
    coverage = record_count / total_possible
    if coverage >= 0.80 and record_count >= 100:
        return "HIGH", round(coverage * 100, 1)
    if coverage >= 0.50 and record_count >= 30:
        return "MEDIUM", round(coverage * 100, 1)
    if coverage >= 0.20 and record_count >= 10:
        return "LOW", round(coverage * 100, 1)
    return "VERY_LOW", round(coverage * 100, 1)


def add_confidence(
    data: dict,
    record_count: int,
    total_possible: int,
    metric_name: str = "metric",
    note: Optional[str] = None,
) -> dict:
    """Wrap any intelligence response with confidence metadata."""
    level, coverage_pct = calculate_confidence(record_count, total_possible)

    disclaimer = {
        "HIGH":    f"Based on {record_count:,} of {total_possible:,} records ({coverage_pct}%). Reliable.",
        "MEDIUM":  f"Based on {record_count:,} of {total_possible:,} records ({coverage_pct}%). Moderately reliable.",
        "LOW":     f"Based on {record_count:,} of {total_possible:,} records ({coverage_pct}%). Limited reliability.",
        "VERY_LOW":f"Based on {record_count:,} of {total_possible:,} records ({coverage_pct}%). Very limited — improve data linkage.",
        "UNKNOWN": "Insufficient data to calculate confidence.",
    }

    data["_intelligence_confidence"] = {
        "level": level,
        "coverage_pct": coverage_pct,
        "record_count": record_count,
        "total_possible": total_possible,
        "metric": metric_name,
        "statement": disclaimer.get(level, ""),
        "note": note,
        "how_to_improve": (
            "Link work orders to assets (currently 7.7% — target 80%+). "
            "Every linked WO improves MTTR, critical path and repeat-failure accuracy."
        ) if level in ("LOW", "VERY_LOW") else None,
    }
    return data
