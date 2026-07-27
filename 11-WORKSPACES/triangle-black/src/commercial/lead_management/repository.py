from __future__ import annotations
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from .models import Lead

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class LeadRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_lead(self, data: dict):
        clean = dict(data or {})
        now = datetime.utcnow()
        lead_id = clean.get("id") or str(uuid.uuid4())

        # Hard defaults for every required field
        payload = {
            "id":         lead_id,
            "hotel_id":   clean.get("hotel_id") or DEFAULT_HOTEL,
            "name":       clean.get("name") or "New Lead",
            "company":    clean.get("company") or "Unknown Company",
            "phone":      clean.get("phone") or "",
            "email":      clean.get("email") or f"lead-{lead_id[:8]}@triangleblack.local",
            "source":     clean.get("source") or "manual",
            "priority":   clean.get("priority") or "medium",
            "status":     clean.get("status") or "new",
            "score":      int(clean.get("score") or 50),
            "agent_id":   clean.get("agent_id"),
            "notes":      clean.get("notes") or "",
            "created_at": clean.get("created_at") or now,
            "updated_at": clean.get("updated_at") or now,
        }

        # Only keep actual ORM columns
        cols = set(Lead.__table__.columns.keys())
        payload = {k: v for k, v in payload.items() if k in cols}

        lead = Lead(**payload)
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get_lead(self, id: str):
        return self.db.query(Lead).filter(Lead.id == id).first()

    def list_leads(self, name: str = None, status: str = None):
        query = self.db.query(Lead)
        if name:
            query = query.filter(Lead.name.contains(name))
        if status:
            query = query.filter(Lead.status == status)
        return query.all()

    def update_lead(self, id: str, data: dict):
        lead = self.db.query(Lead).filter(Lead.id == id).first()
        if not lead:
            return None
        for key, value in data.items():
            if hasattr(lead, key):
                setattr(lead, key, value)
        lead.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def delete_lead(self, id: str):
        lead = self.db.query(Lead).filter(Lead.id == id).first()
        if not lead:
            return None
        self.db.delete(lead)
        self.db.commit()
        return lead
