from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
StockMovement repository — Triangle Black
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from .models import StockMovement

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class StockMovementRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> StockMovement:
        data.setdefault("hotel_id", DEFAULT_HOTEL)
        # Auto-generate sequential number
        if "movement_number" not in data:
            from datetime import datetime as _dt
            now = _dt.utcnow()
            prefix = f"TB-MOV-{now.strftime('%Y%m')}-"
            count = self.db.query(StockMovement).filter(
                StockMovement.movement_number.like(f"{prefix}%")
            ).count()
            data["movement_number"] = f"{prefix}{str(count + 1).zfill(4)}"

        obj = StockMovement(
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

    def get(self, obj_id: str, hotel_id: str = DEFAULT_HOTEL) -> Optional[StockMovement]:
        return (
            self.db.query(StockMovement)
            .filter(StockMovement.id == obj_id, StockMovement.hotel_id == hotel_id)
            .first()
        )

    def list(self, skip: int = 0, limit: int = 100,
             hotel_id: str = DEFAULT_HOTEL) -> List[StockMovement]:
        return (
            self.db.query(StockMovement)
            .filter(StockMovement.hotel_id == hotel_id)
            .order_by(StockMovement.created_at.desc())
            .offset(skip).limit(limit).all()
        )

    def update(self, obj_id: str, data: dict,
               hotel_id: str = DEFAULT_HOTEL) -> Optional[StockMovement]:
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
