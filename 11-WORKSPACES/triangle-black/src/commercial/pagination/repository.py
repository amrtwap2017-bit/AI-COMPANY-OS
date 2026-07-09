from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from .models import PaginatedResponse


class PaginatedResponseRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> PaginatedResponse:
        obj = PaginatedResponse(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **data,
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, obj_id: str) -> Optional[PaginatedResponse]:
        return (
            self.db.query(PaginatedResponse)
            .filter(PaginatedResponse.id == obj_id)
            .first()
        )

    def list(
        self,
        skip: int = 0,
        limit: int = 20,
    ) -> List[PaginatedResponse]:
        return (
            self.db.query(PaginatedResponse)
            .order_by(PaginatedResponse.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update(
        self, obj_id: str, data: dict
    ) -> Optional[PaginatedResponse]:
        obj = self.get(obj_id)
        if not obj:
            return None
        for k, v in data.items():
            if v is not None and k not in (
                "id",
                "created_at",
            ):
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