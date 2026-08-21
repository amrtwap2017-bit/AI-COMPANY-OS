"""
Service for AI Scheduling Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.commercial.ai_scheduling.repository import AISchedulingRepository

class AISchedulingService:
    def __init__(self, db: Session):
        self.repo = AISchedulingRepository(db)

    def get_daily_capacity_plan(self, hotel_id: str) -> Dict[str, Any]:
        techs = self.repo.get_active_technicians_capacity(hotel_id)
        unassigned = self.repo.get_unassigned_work_orders(hotel_id)

        processed_techs = []
        for t in techs:
            max_wo = int(t.get("max_work_orders") or 5)
            curr_wo = int(t.get("current_work_orders") or 0)
            processed_techs.append({
                **t,
                "utilization_pct": round((curr_wo / max(max_wo, 1)) * 100.0, 1)
            })

        return {
            "hotel_id": hotel_id,
            "total_assigned": sum(t.get("current_work_orders", 0) for t in techs),
            "total_unassigned": len(unassigned),
            "technicians": processed_techs,
            "unassigned_orders": unassigned
        }
