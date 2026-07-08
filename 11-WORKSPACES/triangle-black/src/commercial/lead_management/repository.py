"""
Lead repository — data access layer
"""
from __future__ import annotations
import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from .models import Lead


class LeadRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> Lead:
        obj = Lead(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **data,
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, obj_id: str) -> Optional[Lead]:
        return self.db.query(Lead).filter(Lead.id == obj_id).first()

    def list(self, skip: int = 0, limit: int = 100) -> list[Lead]:
        return self.db.query(Lead).offset(skip).limit(limit).all()

    def update(self, obj_id: str, data: dict) -> Optional[Lead]:
        obj = self.get(obj_id)
        if not obj:
            return None
        for k, v in data.items():
            if v is not None:
                setattr(obj, k, v)
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj_id: str) -> bool:
        obj = self.get(obj_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True
