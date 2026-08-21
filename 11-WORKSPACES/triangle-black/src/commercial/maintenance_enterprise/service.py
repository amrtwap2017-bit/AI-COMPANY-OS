"""
Service for Maintenance Enterprise Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.commercial.maintenance_enterprise.repository import MaintenanceEnterpriseRepository

class MaintenanceEnterpriseService:
    def __init__(self, db: Session):
        self.repo = MaintenanceEnterpriseRepository(db)

    def get_dashboard_overview(self, hotel_id: str) -> Dict[str, Any]:
        metrics = self.repo.get_dashboard_metrics(hotel_id)
        total = int(metrics.get("total_plans") or 0)
        overdue = int(metrics.get("overdue_plans") or 0)
        compliance = round((total - overdue) / max(total, 1) * 100.0, 1) if total > 0 else 100.0

        return {
            "hotel_id": hotel_id,
            "total_pm_plans": total,
            "active_plans": int(metrics.get("active_plans") or 0),
            "overdue_pm_count": overdue,
            "pm_compliance_rate": compliance
        }

    def get_pm_plans(self, hotel_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        return self.repo.list_pm_plans(hotel_id, limit)
