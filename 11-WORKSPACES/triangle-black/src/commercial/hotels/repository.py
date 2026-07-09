"""
Hotel repository — Triangle Black
Hotels are tenants — no hotel_id scoping applied to Hotel queries.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models import Hotel


class HotelRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> Hotel:
        obj = Hotel(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **{k: v for k, v in data.items()
               if k not in ("id", "created_at", "updated_at")},
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, hotel_id: str) -> Optional[Hotel]:
        return (
            self.db.query(Hotel)
            .filter(Hotel.id == hotel_id)
            .first()
        )

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = False,
    ) -> list[Hotel]:
        q = self.db.query(Hotel)
        if active_only:
            q = q.filter(Hotel.is_active == True)
        return q.order_by(Hotel.name).offset(skip).limit(limit).all()

    def update(self, hotel_id: str, data: dict) -> Optional[Hotel]:
        obj = self.get(hotel_id)
        if not obj:
            return None
        for k, v in data.items():
            if v is not None and k not in ("id", "created_at"):
                setattr(obj, k, v)
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, hotel_id: str) -> bool:
        obj = self.get(hotel_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True
