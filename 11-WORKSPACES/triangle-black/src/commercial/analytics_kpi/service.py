"""
Service for Analytics KPI Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.commercial.analytics_kpi.repository import AnalyticsKPIRepository

class AnalyticsKPIService:
    def __init__(self, db: Session):
        self.repo = AnalyticsKPIRepository(db)

    def get_enterprise_overview(self, hotel_id: str) -> Dict[str, Any]:
        kpis = self.repo.get_kpis_aggregation(hotel_id)
        cashflow_raw = self.repo.get_cashflow_projections(hotel_id)

        processed_cashflow = []
        for point in cashflow_raw:
            inflow = float(point.get("inflow", 0.0))
            outflow = float(point.get("outflow", 0.0))
            processed_cashflow.append({
                "month": point.get("month", "Unknown"),
                "inflow": inflow,
                "outflow": outflow,
                "net": round(inflow - outflow, 2)
            })

        return {
            "hotel_id": hotel_id,
            "overall": kpis,
            "cashflow": processed_cashflow
        }
