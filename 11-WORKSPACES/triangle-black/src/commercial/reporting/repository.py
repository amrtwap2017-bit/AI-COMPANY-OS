from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
Report repository
"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models import Report


class ReportRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> Report:
        obj = Report(id=str(uuid.uuid4()), created_at=datetime.utcnow(),
                       updated_at=datetime.utcnow(), **data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, obj_id: str) -> Optional[Report]:
        return self.db.query(Report).filter(Report.id == obj_id).first()

    def list(self, skip: int = 0, limit: int = 100) -> list[Report]:
        return self.db.query(Report).offset(skip).limit(limit).all()

    def update(self, obj_id: str, data: dict) -> Optional[Report]:
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
