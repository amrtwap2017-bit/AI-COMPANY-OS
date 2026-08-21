"""
Service for Predictive Maintenance Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.commercial.predictive_maintenance.repository import PredictiveMaintenanceRepository

class PredictiveMaintenanceService:
    def __init__(self, db: Session):
        self.repo = PredictiveMaintenanceRepository(db)

    def calculate_health(self, days_since_maint: int, corrective_wos: int, criticality: str) -> float:
        penalty = min(50.0, days_since_maint * 0.5) + min(50.0, corrective_wos * 15.0)
        mult = 1.2 if criticality == "critical" else (1.1 if criticality == "high" else 1.0)
        score = max(10.0, 100.0 - (penalty * mult))
        return round(score, 1)

    def get_health_overview(self, hotel_id: str) -> Dict[str, Any]:
        assets_data = self.repo.get_assets_telemetry(hotel_id)
        scored_assets = []
        cat_map: Dict[str, List[float]] = {}

        for a in assets_data:
            score = self.calculate_health(
                a.get("days_since_maintenance", 90),
                a.get("corrective_wos_90d", 0),
                a.get("criticality", "medium")
            )
            grade = "A" if score >= 85 else ("B" if score >= 70 else ("C" if score >= 50 else "D"))
            risk = "low" if score >= 75 else ("medium" if score >= 50 else "high")

            asset_entry = {
                **a,
                "health_score": score,
                "health_grade": grade,
                "risk_level": risk
            }
            scored_assets.append(asset_entry)
            cat = a.get("category", "General")
            cat_map.setdefault(cat, []).append(score)

        category_summary = [
            {
                "category": cat,
                "total_assets": len(scores),
                "avg_health_score": round(sum(scores) / max(len(scores), 1), 1)
            }
            for cat, scores in cat_map.items()
        ]

        total_assets = len(scored_assets)
        overall_avg = round(sum(a["health_score"] for a in scored_assets) / max(total_assets, 1), 1) if total_assets else 100.0

        return {
            "hotel_id": hotel_id,
            "overall_health_score": overall_avg,
            "total_assets_monitored": total_assets,
            "assets": scored_assets,
            "category_summary": category_summary
        }
