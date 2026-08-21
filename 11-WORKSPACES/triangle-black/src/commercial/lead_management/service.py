"""
Application Service for Lead Management Domain (Sprint U-003)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.commercial.lead_management.repository import LeadRepository
from src.core.audit import audit_create, audit_update, audit_action

class LeadManagementService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"
        self.repo = LeadRepository(db)

    def get_by_id(self, lead_id: str) -> Optional[Dict[str, Any]]:
        lead = self.repo.get_by_id(lead_id, self.hotel_id)
        return getattr(lead, "to_dict", lambda: dict(lead.__dict__))() if lead else None

    def list_leads(self, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        return self.repo.list_leads(hotel_id=self.hotel_id, status=status, limit=limit, skip=skip)

    def create_lead(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload["hotel_id"] = self.hotel_id
        lead = self.repo.create(payload)
        lid = str(getattr(lead, "id", ""))
        try:
            audit_create(self.db, "lead", lid, self.actor, self.hotel_id)
        except Exception:
            pass
        return getattr(lead, "to_dict", lambda: dict(lead.__dict__))()

    def qualify_lead(self, lead_id: str, score: int = 85) -> Optional[Dict[str, Any]]:
        updated = self.repo.update(lead_id, self.hotel_id, {
            "status": "qualified",
            "score": score,
            "updated_at": datetime.utcnow()
        })
        if updated:
            try:
                audit_action(self.db, "lead", lead_id, "QUALIFY", self.actor, {"score": score})
            except Exception:
                pass
        return getattr(updated, "to_dict", lambda: dict(updated.__dict__))() if updated else None
