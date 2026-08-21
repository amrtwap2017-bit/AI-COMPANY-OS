"""
Service for Executive Intelligence Domain
"""
from typing import Dict, Any
from sqlalchemy.orm import Session
from src.commercial.executive_intelligence.repository import ExecutiveIntelligenceRepository

class ExecutiveIntelligenceService:
    def __init__(self, db: Session):
        self.repo = ExecutiveIntelligenceRepository(db)

    def get_intelligence_overview(self, hotel_id: str) -> Dict[str, Any]:
        ops = self.repo.get_operations_snapshot(hotel_id)
        fin = self.repo.get_financial_snapshot(hotel_id)

        crit = ops.get("critical_open", 0)
        status = "critical" if crit > 2 else ("warning" if crit > 0 else "healthy")

        return {
            "hotel_id": hotel_id,
            "summary_status": status,
            "operations": ops,
            "financial": fin
        }
