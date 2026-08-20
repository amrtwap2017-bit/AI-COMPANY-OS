"""
Service layer for SLA Dashboard Domain
"""
from typing import Dict, Any
from sqlalchemy.orm import Session
from src.commercial.sla_dashboard.repository import SLADashboardRepository
from src.commercial.sla_dashboard.schemas import SLADashboardSummary, SLAMetric, SLAPriorityBreakdown

class SLADashboardService:
    def __init__(self, db: Session):
        self.repo = SLADashboardRepository(db)

    def get_summary(self, hotel_id: str) -> Dict[str, Any]:
        metrics = self.repo.get_hotel_sla_metrics(hotel_id)
        breakdown = self.repo.get_priority_breakdown(hotel_id)
        breaches = self.repo.get_recent_breaches(hotel_id)
        
        return {
            "hotel_id": hotel_id,
            "overall": metrics,
            "by_priority": breakdown,
            "recent_breaches": breaches,
        }
