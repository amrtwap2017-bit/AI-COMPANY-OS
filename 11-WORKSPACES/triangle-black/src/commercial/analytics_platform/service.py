"""
Service for Analytics Platform Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.commercial.analytics_platform.repository import AnalyticsPlatformRepository

class AnalyticsPlatformService:
    def __init__(self, db: Session):
        self.repo = AnalyticsPlatformRepository(db)

    def get_platform_scorecards(self, hotel_id: str) -> Dict[str, Any]:
        raw = self.repo.get_scorecard_raw_data(hotel_id)
        
        total_wos = raw.get("total_wos", 0)
        completed_wos = raw.get("completed_wos", 0)
        breached_wos = raw.get("breached_wos", 0)
        operational_assets = raw.get("operational_assets", 0)
        total_assets = raw.get("total_assets", 0)

        # Operational Score calculation
        ops_score = 100.0 - (round(breached_wos / max(total_wos, 1) * 100.0, 1) if total_wos > 0 else 0.0)
        
        # Maintenance Score calculation
        maint_score = round(operational_assets / max(total_assets, 1) * 100.0, 1) if total_assets > 0 else 100.0

        # General sourcing/inventory score mock placeholder (sourcing score)
        sourcing_score = 92.5

        overall_health = round((ops_score + maint_score + sourcing_score) / 3.0, 1)

        return {
            "hotel_id": hotel_id,
            "scorecards": {
                "hotel_id": hotel_id,
                "operations_score": max(20.0, min(100.0, ops_score)),
                "maintenance_score": max(20.0, min(100.0, maint_score)),
                "sourcing_score": sourcing_score,
                "overall_health": max(20.0, min(100.0, overall_health))
            },
            "sla_trends": self._get_sla_trends(hotel_id)
        }

    def _get_sla_trends(self, hotel_id: str) -> List[Dict[str, Any]]:
        raw_trends = self.repo.get_sla_trend_timeline(hotel_id)
        timeline = []
        for point in raw_trends:
            total = point.get("total_orders", 0)
            breach = point.get("breach_count", 0)
            res_rate = round((total - breach) / max(total, 1) * 100.0, 1) if total > 0 else 100.0
            timeline.append({
                "date_str": point.get("date_str", ""),
                "breach_count": breach,
                "resolution_rate": res_rate
            })
        return timeline
