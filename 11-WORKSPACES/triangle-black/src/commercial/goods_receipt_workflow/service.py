"""
Service for Goods Receipt Workflow Domain
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from src.commercial.goods_receipt_workflow.repository import GoodsReceiptWorkflowRepository

class GoodsReceiptWorkflowService:
    def __init__(self, db: Session):
        self.repo = GoodsReceiptWorkflowRepository(db)

    def get_pending_receipts(self, hotel_id: str) -> List[Dict[str, Any]]:
        return self.repo.get_pending_pos(hotel_id)

    def get_cycle_status(self, pr_id: str, hotel_id: str) -> Dict[str, Any]:
        data = self.repo.get_cycle_status(pr_id, hotel_id)
        if not data:
            return {"purchase_request_id": pr_id, "current_stage": "not_found", "is_completed": False}

        stage = "completed" if data.get("gr_id") else ("po_issued" if data.get("po_id") else "pr_pending")
        return {
            "purchase_request_id": pr_id,
            "current_stage": stage,
            "is_completed": (stage == "completed"),
            "details": data
        }
