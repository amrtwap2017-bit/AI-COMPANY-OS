"""
Activity repository
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models import Activity


class ActivityRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> Activity:
        obj = Activity(id=str(uuid.uuid4()), created_at=datetime.utcnow(),
                       updated_at=datetime.utcnow(), **data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, obj_id: str) -> Optional[Activity]:
        return self.db.query(Activity).filter(Activity.id == obj_id).first()

    def list(self, skip: int = 0, limit: int = 100) -> list[Activity]:
        return self.db.query(Activity).offset(skip).limit(limit).all()

    def update(self, obj_id: str, data: dict) -> Optional[Activity]:
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
