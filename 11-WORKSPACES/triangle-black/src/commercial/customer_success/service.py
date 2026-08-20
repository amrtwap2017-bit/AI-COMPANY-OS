"""
Service for Customer Success Domain
"""
from typing import Dict, Any
from sqlalchemy.orm import Session
from src.commercial.customer_success.repository import CustomerSuccessRepository

class CustomerSuccessService:
    def __init__(self, db: Session):
        self.repo = CustomerSuccessRepository(db)

    def get_overview(self, hotel_id: str) -> Dict[str, Any]:
        overview = self.repo.get_account_overview(hotel_id)
        at_risk = self.repo.get_at_risk_contracts(hotel_id)
        
        # Calculate health score heuristic
        open_wos = overview.get("open_work_orders", 0)
        health_score = max(50.0, min(100.0, 100.0 - (open_wos * 2.0)))
        
        return {
            "hotel_id": hotel_id,
            "metrics": overview,
            "health_score": round(health_score, 1),
            "at_risk_renewals": at_risk,
            "risk_level": "medium" if len(at_risk) > 0 else "low"
        }
