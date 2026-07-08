from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models import Contract


class ContractRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> Contract:
        obj = Contract(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **data,
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, obj_id: str) -> Optional[Contract]:
        return self.db.query(Contract).filter(Contract.id == obj_id).first()

    def list(self, skip: int = 0, limit: int = 100,
             status: str = None) -> list[Contract]:
        q = self.db.query(Contract)
        if status:
            q = q.filter(Contract.status == status)
        return q.order_by(Contract.created_at.desc()).offset(skip).limit(limit).all()

    def update(self, obj_id: str, data: dict) -> Optional[Contract]:
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
