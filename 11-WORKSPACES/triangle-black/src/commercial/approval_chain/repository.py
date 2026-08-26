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


def get_all(db, hotel_id: str, limit: int = 100):
    """Get all approval_chain items for a hotel."""
    from sqlalchemy import text
    try:
        rows = db.execute(text("""
            SELECT * FROM approval_chain
            WHERE hotel_id = :hid
            ORDER BY created_at DESC
            LIMIT :lim
        """), {"hid": hotel_id, "lim": limit}).fetchall()
        return [dict(r._mapping) for r in rows]
    except Exception:
        return []


def add_step(db, hotel_id: str, entity_type: str, entity_id: str,
             approver_role: str, step_order: int = 1):
    """Add an approval step to the chain."""
    from sqlalchemy import text
    import uuid, datetime
    try:
        db.execute(text("""
            INSERT INTO approval_chain
            (id, hotel_id, entity_type, entity_id, approver_role, step_order,
             status, created_at, updated_at)
            VALUES (:id, :hid, :etype, :eid, :role, :step, 'pending',
                    NOW(), NOW())
            ON CONFLICT DO NOTHING
        """), {"id": str(uuid.uuid4()), "hid": hotel_id, "etype": entity_type,
               "eid": entity_id, "role": approver_role, "step": step_order})
        db.commit()
        return True
    except Exception:
        return False


def update_step(db, step_id: str, status: str, hotel_id: str = None):
    """Update an approval step status."""
    from sqlalchemy import text
    try:
        db.execute(text("""
            UPDATE approval_chain SET status = :status, updated_at = NOW()
            WHERE id = :sid
        """), {"status": status, "sid": step_id})
        db.commit()
        return True
    except Exception:
        return False
