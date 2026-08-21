"""
Application Service for Quotation Domain (Sprint U-003)
Uses QuoteRepository and Quote ORM model.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.commercial.quotation.repository import QuoteRepository
from src.core.audit import audit_create, audit_action

class QuotationService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"
        self.repo = QuoteRepository(db)

    def get_by_id(self, quote_id: str) -> Optional[Dict[str, Any]]:
        q = self.repo.get(quote_id, self.hotel_id)
        return getattr(q, "to_dict", lambda: dict(q.__dict__))() if q else None

    def list_quotes(self, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        # Existing repository doesn't have list_quotes; use safe fallback or query on model directly
        from src.commercial.quotation.models import Quote
        query = self.db.query(Quote).filter(Quote.hotel_id == self.hotel_id)
        if status:
            query = query.filter(Quote.status == status)
        rows = query.order_by(Quote.created_at.desc()).offset(skip).limit(limit).all()
        return [getattr(r, "to_dict", lambda: dict(r.__dict__))() for r in rows]

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
        # Leverage repository or session update
        from src.commercial.quotation.models import Quote
        quote = self.repo.get(quote_id, self.hotel_id)
        if not quote:
            return None
        quote.status = "approved"
        quote.updated_at = datetime.utcnow()
        self.db.commit()
        try:
            audit_action(self.db, "quotation", quote_id, "APPROVE", self.actor)
        except Exception:
            pass
        return getattr(quote, "to_dict", lambda: dict(quote.__dict__))()
