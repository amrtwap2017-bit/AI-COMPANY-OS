"""
Application Service for Purchase Requests Domain (Sprint U-003)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.commercial.purchase_requests.repository import PurchaseRequestRepository
from src.core.audit import audit_create, audit_update, audit_action

class PurchaseRequestService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"
        self.repo = PurchaseRequestRepository(db)

    def get_by_id(self, pr_id: str) -> Optional[Dict[str, Any]]:
        pr = self.repo.get_by_id(pr_id, self.hotel_id)
        return getattr(pr, "to_dict", lambda: dict(pr.__dict__))() if pr else None

    def list_requests(self, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        return self.repo.list_requests(hotel_id=self.hotel_id, status=status, limit=limit, skip=skip)

    def create_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload["hotel_id"] = self.hotel_id
        pr = self.repo.create(payload)
        pr_id = str(getattr(pr, "id", ""))
        try:
            audit_create(self.db, "purchase_request", pr_id, self.actor, self.hotel_id)
        except Exception:
            pass
        return getattr(pr, "to_dict", lambda: dict(pr.__dict__))()

    def approve_request(self, pr_id: str) -> Optional[Dict[str, Any]]:
        updated = self.repo.update(pr_id, self.hotel_id, {"status": "approved", "updated_at": datetime.utcnow()})
        if updated:
            try:
                audit_action(self.db, "purchase_request", pr_id, "APPROVE", self.actor)
            except Exception:
                pass
        return getattr(updated, "to_dict", lambda: dict(updated.__dict__))() if updated else None
