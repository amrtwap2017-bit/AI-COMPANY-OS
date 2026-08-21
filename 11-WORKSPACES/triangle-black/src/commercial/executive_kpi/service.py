"""
Service for Executive KPI Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.commercial.executive_kpi.repository import ExecutiveKPIRepository

class ExecutiveKPIService:
    def __init__(self, db: Session):
        self.repo = ExecutiveKPIRepository(db)

    def get_kpi_summary(self, hotel_id: str) -> Dict[str, Any]:
        return self.repo.get_summary_metrics(hotel_id)

    def get_revenue_timeline(self, hotel_id: str) -> List[Dict[str, Any]]:
        raw = self.repo.get_revenue_trends(hotel_id)
        return [{"period": r.get("period"), "metric_name": "Revenue", "value": float(r.get("value") or 0.0)} for r in raw]

    def get_balanced_scorecard(self, hotel_id: str) -> Dict[str, Any]:
        metrics = self.repo.get_summary_metrics(hotel_id)
        sla = metrics.get("sla_compliance_rate", 100.0)
        
        fin_score = 95.0
        cust_score = metrics.get("customer_satisfaction_score", 90.0)
        ops_score = sla
        lg_score = 88.0
        overall = round((fin_score + cust_score + ops_score + lg_score) / 4.0, 2)

        return {
            "hotel_id": hotel_id,
            "financial_score": fin_score,
            "customer_score": cust_score,
            "internal_operations_score": ops_score,
            "learning_growth_score": lg_score,
            "overall_score": overall
        }
