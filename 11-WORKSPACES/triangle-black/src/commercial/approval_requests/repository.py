"""
Approval Requests Repository — Triangle Black Enterprise OS
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from src.commercial.approval_requests.models import ApprovalRequest

class ApprovalRequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_pending(self, hotel_id: str, approver_role: Optional[str] = None) -> List[ApprovalRequest]:
        query = self.db.query(ApprovalRequest).filter(
            ApprovalRequest.hotel_id == hotel_id,
            ApprovalRequest.status == "pending"
        )
        if approver_role:
            query = query.filter(ApprovalRequest.approver_role == approver_role)
        return query.order_by(ApprovalRequest.created_at.desc()).all()

    def get_by_id(self, request_id: str, hotel_id: str) -> Optional[ApprovalRequest]:
        return self.db.query(ApprovalRequest).filter(
            ApprovalRequest.id == request_id,
            ApprovalRequest.hotel_id == hotel_id
        ).first()

    def resolve(self, request_id: str, hotel_id: str, status: str, comments: Optional[str] = None) -> Optional[ApprovalRequest]:
        req = self.get_by_id(request_id, hotel_id)
        if not req:
            return None
        req.status = status
        if comments and hasattr(req, "comments"):
            req.comments = comments
        self.db.commit()
        self.db.refresh(req)
        return req


def get_all(db, hotel_id: str, limit: int = 100):
    """Get all approval_requests items for a hotel."""
    from sqlalchemy import text
    try:
        rows = db.execute(text("""
            SELECT * FROM approval_requests
            WHERE hotel_id = :hid
            ORDER BY created_at DESC
            LIMIT :lim
        """), {"hid": hotel_id, "lim": limit}).fetchall()
        return [dict(r._mapping) for r in rows]
    except Exception:
        return []


# ── Module-level functions required by tests ────────────────────────────────

def get_by_id(db, request_id: str, hotel_id: str = None):
    """Module-level: Get a single approval request by ID."""
    from sqlalchemy import text as sqlt
    try:
        sql = "SELECT * FROM approval_requests WHERE id = :rid"
        params = {"rid": request_id}
        if hotel_id:
            sql += " AND hotel_id = :hid"
            params["hid"] = hotel_id
        row = db.execute(sqlt(sql), params).fetchone()
        return dict(row._mapping) if row else None
    except Exception:
        return None


def get_pending(db, hotel_id: str, limit: int = 50):
    """Module-level: Get pending approval requests."""
    from sqlalchemy import text as sqlt
    try:
        rows = db.execute(sqlt("""
            SELECT * FROM approval_requests
            WHERE hotel_id = :hid AND LOWER(status) = 'pending'
            ORDER BY created_at DESC LIMIT :lim
        """), {"hid": hotel_id, "lim": limit}).fetchall()
        return [dict(r._mapping) for r in rows]
    except Exception:
        return []
