"""
Application Service for Quotation Domain (Sprint U-003)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.commercial.quotation.repository import QuotationRepository
from src.core.audit import audit_create, audit_action

class QuotationService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"
        self.repo = QuotationRepository(db)

    def get_by_id(self, quote_id: str) -> Optional[Dict[str, Any]]:
        q = self.repo.get_by_id(quote_id, self.hotel_id)
        return getattr(q, "to_dict", lambda: dict(q.__dict__))() if q else None

    def list_quotes(self, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        return self.repo.list_quotes(hotel_id=self.hotel_id, status=status, limit=limit, skip=skip)

    def create_quote(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload["hotel_id"] = self.hotel_id
        quote = self.repo.create(payload)
        qid = str(getattr(quote, "id", ""))
        try:
            audit_create(self.db, "quotation", qid, self.actor, self.hotel_id)
        except Exception:
            pass
        return getattr(quote, "to_dict", lambda: dict(quote.__dict__))()

    def approve_quote(self, quote_id: str) -> Optional[Dict[str, Any]]:
        updated = self.repo.update(quote_id, self.hotel_id, {"status": "approved", "updated_at": datetime.utcnow()})
        if updated:
            try:
                audit_action(self.db, "quotation", quote_id, "APPROVE", self.actor)
            except Exception:
                pass
        return getattr(updated, "to_dict", lambda: dict(updated.__dict__))() if updated else None
