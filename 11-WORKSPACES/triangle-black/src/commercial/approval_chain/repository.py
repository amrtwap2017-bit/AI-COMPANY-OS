"""
Approval Chain Repository — Triangle Black Enterprise OS
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from src.commercial.approval_chain.models import PRApprovalChain

class ApprovalChainRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_chain(self, hotel_id: str, min_amount: float = 0.0) -> List[PRApprovalChain]:
        return self.db.query(PRApprovalChain).filter(
            PRApprovalChain.hotel_id == hotel_id,
            PRApprovalChain.min_amount <= min_amount
        ).order_by(PRApprovalChain.step_order.asc()).all()

    def list_all(self, hotel_id: str) -> List[PRApprovalChain]:
        return self.db.query(PRApprovalChain).filter(
            PRApprovalChain.hotel_id == hotel_id
        ).order_by(PRApprovalChain.step_order.asc()).all()
