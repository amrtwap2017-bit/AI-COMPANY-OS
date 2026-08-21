"""
Service for AI Signals Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.commercial.ai_signals.repository import AISignalsRepository

class AISignalsService:
    def __init__(self, db: Session):
        self.repo = AISignalsRepository(db)

    def generate_signals(self, hotel_id: str) -> Dict[str, Any]:
        failures = self.repo.get_repeated_failures(hotel_id)
        overdue = self.repo.get_overdue_work_orders(hotel_id)

        signals_list = []

        # 1. Repeat Failures Signals
        for f in failures:
            signals_list.append({
                "signal_type": "asset_repeat_failures",
                "target_id": f["asset_id"],
                "target_name": f["asset_name"],
                "severity": "critical" if f["criticality"] == "critical" else "high",
                "description": f"Asset '{f['asset_name']}' experienced {f['wo_count']} corrective failures in the last 90 days.",
                "metadata": {"wo_count": f["wo_count"], "category": f["asset_category"]}
            })

        # 2. Overdue Work Order Signals
        for o in overdue:
            signals_list.append({
                "signal_type": "overdue_work_order",
                "target_id": o["id"],
                "target_name": o["title"],
                "severity": "critical" if o["priority"] in ("critical", "high") else "medium",
                "description": f"Work order '{o['title']}' is currently overdue.",
                "metadata": {"due_date": str(o["due_date"]), "priority": o["priority"]}
            })

        return {
            "hotel_id": hotel_id,
            "total_signals": len(signals_list),
            "signals": signals_list
        }
