from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
PurchaseRequest repository — Triangle Black
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from .models import PurchaseRequest

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class PurchaseRequestRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> PurchaseRequest:
        data.setdefault("hotel_id", DEFAULT_HOTEL)
        # Auto-generate sequential number
        if "pr_number" not in data:
            from datetime import datetime as _dt
            now = _dt.utcnow()
            prefix = f"TB-PR-{now.strftime('%Y%m')}-"
            count = self.db.query(PurchaseRequest).filter(
                PurchaseRequest.pr_number.like(f"{prefix}%")
            ).count()
            data["pr_number"] = f"{prefix}{str(count + 1).zfill(4)}"

        obj = PurchaseRequest(
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

    def get(self, obj_id: str, hotel_id: str = DEFAULT_HOTEL) -> Optional[PurchaseRequest]:
        return (
            self.db.query(PurchaseRequest)
            .filter(PurchaseRequest.id == obj_id, PurchaseRequest.hotel_id == hotel_id)
            .first()
        )

    def list(self, skip: int = 0, limit: int = 100,
             hotel_id: str = DEFAULT_HOTEL) -> List[PurchaseRequest]:
        return (
            self.db.query(PurchaseRequest)
            .filter(PurchaseRequest.hotel_id == hotel_id)
            .order_by(PurchaseRequest.created_at.desc())
            .offset(skip).limit(limit).all()
        )

    def update(self, obj_id: str, data: dict,
               hotel_id: str = DEFAULT_HOTEL) -> Optional[PurchaseRequest]:
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
