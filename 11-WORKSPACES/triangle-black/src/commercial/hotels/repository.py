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
        hotel = Hotel(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **data,
        )
        self.db.add(hotel)
        self.db.commit()
        self.db.refresh(hotel)
        return hotel

    def get(self, hotel_id: str) -> Optional[Hotel]:
        return self.db.query(Hotel).filter(Hotel.id == hotel_id).first()

    def get_by_slug(self, slug: str) -> Optional[Hotel]:
        return self.db.query(Hotel).filter(Hotel.slug == slug).first()

    def list(self, active_only: bool = False) -> list[Hotel]:
        q = self.db.query(Hotel)
        if active_only:
            q = q.filter(Hotel.is_active == True)
        return q.order_by(Hotel.created_at.desc()).all()

    def update(self, hotel_id: str, data: dict) -> Optional[Hotel]:
        hotel = self.get(hotel_id)
        if not hotel:
            return None
        for k, v in data.items():
            if v is not None:
                setattr(hotel, k, v)
        hotel.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(hotel)
        return hotel

    def deactivate(self, hotel_id: str) -> bool:
        hotel = self.get(hotel_id)
        if not hotel:
            return False
        hotel.is_active = False
        hotel.updated_at = datetime.utcnow()
        self.db.commit()
        return True
