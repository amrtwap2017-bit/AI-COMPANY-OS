from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models import Lead

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class LeadRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> Lead:
        data.setdefault("hotel_id", DEFAULT_HOTEL)
        lead = Lead(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **data,
        )
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get(self, lead_id: str, hotel_id: str = DEFAULT_HOTEL) -> Optional[Lead]:
        return (
            self.db.query(Lead)
            .filter(Lead.id == lead_id, Lead.hotel_id == hotel_id)
            .first()
        )

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        hotel_id: str = DEFAULT_HOTEL,
        status: Optional[str] = None,
    ) -> list[Lead]:
        q = self.db.query(Lead).filter(Lead.hotel_id == hotel_id)
        if status:
            q = q.filter(Lead.status == status)
        return q.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()

    def update(
        self,
        lead_id: str,
        data: dict,
        hotel_id: str = DEFAULT_HOTEL,
    ) -> Optional[Lead]:
        lead = self.get(lead_id, hotel_id=hotel_id)
        if not lead:
            return None
        for k, v in data.items():
            if v is not None and k != "hotel_id":
                setattr(lead, k, v)
        lead.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def delete(self, lead_id: str, hotel_id: str = DEFAULT_HOTEL) -> bool:
        lead = self.get(lead_id, hotel_id=hotel_id)
        if not lead:
            return False
        self.db.delete(lead)
        self.db.commit()
        return True
