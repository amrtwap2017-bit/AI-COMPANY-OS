"""
Learning Engine — public API.

Usage:
    from app.learning.engine import LearningEngine

    engine = LearningEngine(db)
    report = engine.run()

    print(f"Insights: {len(report.insights)}")
    print(f"Summary: {report.summary}")

    for insight in report.insights:
        print(f"[{insight.priority}] {insight.title}")
        print(f"  → {insight.recommendation}")
"""

from app.learning.engine import LearningEngine
from app.learning.models import LearningReport, LearningInsight, InsightType

__all__ = ["LearningEngine", "LearningReport", "LearningInsight", "InsightType"]
