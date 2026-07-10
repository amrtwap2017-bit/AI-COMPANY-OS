"""
Hotel repository — Triangle Black
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models import Hotel

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class HotelRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> Hotel:
        data.setdefault("hotel_id", DEFAULT_HOTEL)
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

    def get(self, obj_id: str, hotel_id: str = DEFAULT_HOTEL) -> Optional[Hotel]:
        return (
            self.db.query(Hotel)
            .filter(Hotel.id == obj_id, Hotel.hotel_id == hotel_id)
            .first()
        )

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        hotel_id: str = DEFAULT_HOTEL,
    ) -> list[Hotel]:
        return (
            self.db.query(Hotel)
            .filter(Hotel.hotel_id == hotel_id)
            .order_by(Hotel.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update(
        self, obj_id: str, data: dict, hotel_id: str = DEFAULT_HOTEL
    ) -> Optional[Hotel]:
        obj = self.get(obj_id, hotel_id=hotel_id)
        if not obj:
            return None
        for k, v in data.items():
            if v is not None and k not in ("id", "hotel_id", "created_at"):
                setattr(obj, k, v)
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj_id: str, hotel_id: str = DEFAULT_HOTEL) -> bool:
        obj = self.get(obj_id, hotel_id=hotel_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True
