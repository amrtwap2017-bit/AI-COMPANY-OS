"""
Service for Warehouse Intelligence Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.commercial.warehouse_intelligence.repository import WarehouseIntelligenceRepository

class WarehouseIntelligenceService:
    def __init__(self, db: Session):
        self.repo = WarehouseIntelligenceRepository(db)

    def get_intelligence_summary(self, hotel_id: str) -> Dict[str, Any]:
        health = self.repo.get_stock_health(hotel_id)
        candidates = self.repo.get_reorder_candidates(hotel_id)

        reorder_plan = []
        for c in candidates:
            min_stk = float(c.get("min_stock") or 0.0)
            on_hand = float(c.get("qty_on_hand") or 0.0)
            unit_price = float(c.get("unit_price") or 0.0)
            rec_qty = max(0.0, (min_stk * 2.0) - on_hand)

            reorder_plan.append({
                **c,
                "recommended_order_qty": rec_qty,
                "estimated_cost": round(rec_qty * unit_price, 2)
            })

        return {
            "hotel_id": hotel_id,
            "health": health,
            "reorder_plan": reorder_plan,
            "reorder_count": len(reorder_plan)
        }
