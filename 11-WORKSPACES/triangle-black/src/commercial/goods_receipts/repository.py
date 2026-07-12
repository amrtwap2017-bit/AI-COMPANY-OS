from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
GoodsReceipt repository — Triangle Black
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from .models import GoodsReceipt

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class GoodsReceiptRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> GoodsReceipt:
        data.setdefault("hotel_id", DEFAULT_HOTEL)
        # Auto-generate sequential number
        if "grn_number" not in data:
            from datetime import datetime as _dt
            now = _dt.utcnow()
            prefix = f"TB-GRN-{now.strftime('%Y%m')}-"
            count = self.db.query(GoodsReceipt).filter(
                GoodsReceipt.grn_number.like(f"{prefix}%")
            ).count()
            data["grn_number"] = f"{prefix}{str(count + 1).zfill(4)}"

        obj = GoodsReceipt(
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

    def get(self, obj_id: str, hotel_id: str = DEFAULT_HOTEL) -> Optional[GoodsReceipt]:
        return (
            self.db.query(GoodsReceipt)
            .filter(GoodsReceipt.id == obj_id, GoodsReceipt.hotel_id == hotel_id)
            .first()
        )

    def list(self, skip: int = 0, limit: int = 100,
             hotel_id: str = DEFAULT_HOTEL) -> List[GoodsReceipt]:
        return (
            self.db.query(GoodsReceipt)
            .filter(GoodsReceipt.hotel_id == hotel_id)
            .order_by(GoodsReceipt.created_at.desc())
            .offset(skip).limit(limit).all()
        )

    def update(self, obj_id: str, data: dict,
               hotel_id: str = DEFAULT_HOTEL) -> Optional[GoodsReceipt]:
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
