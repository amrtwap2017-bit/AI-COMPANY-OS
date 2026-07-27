from __future__ import annotations
from datetime import datetime
import uuid
from typing import Optional, List, Any
from sqlalchemy.orm import Session

from .models import PurchaseRequest

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class PurchaseRequestRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> PurchaseRequest:
        clean = dict(data or {})
        now = datetime.utcnow()

        clean.setdefault("id", str(uuid.uuid4()))
        clean.setdefault("hotel_id", DEFAULT_HOTEL)

        # Auto-generate sequential number
        if not clean.get("pr_number"):
            prefix = f"TB-PR-{now.strftime('%Y%m')}-"
            count = self.db.query(PurchaseRequest).filter(
                PurchaseRequest.pr_number.like(f"{prefix}%")
            ).count()
            clean["pr_number"] = f"{prefix}{str(count + 1).zfill(4)}"

        # Safe defaults for minimal-body create
        clean.setdefault("requester", "Portal User")
        clean.setdefault("department", "Engineering")
        clean.setdefault("urgency", "normal")
        clean.setdefault("status", "pending")
        clean.setdefault("justification", "")
        clean.setdefault("required_date", now)
        clean.setdefault("created_at", now)
        clean.setdefault("updated_at", now)

        # Normalize lines: accept string "[]", None, list
        lines = clean.get("lines", [])
        if lines is None:
            lines = []
        elif isinstance(lines, str):
            import json
            try:
                lines = json.loads(lines) if lines.strip() else []
            except Exception:
                lines = []
        elif not isinstance(lines, list):
            lines = []
        clean["lines"] = lines

        # If model doesn't support title, don't pass it
        cols = set(PurchaseRequest.__table__.columns.keys())
        payload = {k: v for k, v in clean.items() if k in cols}

        obj = PurchaseRequest(**payload)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, pr_id: str, hotel_id: str = DEFAULT_HOTEL) -> Optional[PurchaseRequest]:
        return self.db.query(PurchaseRequest).filter(
            PurchaseRequest.id == pr_id,
            PurchaseRequest.hotel_id == hotel_id,
        ).first()

    def list(self, skip: int = 0, limit: int = 100, hotel_id: str = DEFAULT_HOTEL) -> List[PurchaseRequest]:
        return self.db.query(PurchaseRequest).filter(
            PurchaseRequest.hotel_id == hotel_id
        ).order_by(PurchaseRequest.created_at.desc()).offset(skip).limit(limit).all()

    def update(self, pr_id: str, data: dict, hotel_id: str = DEFAULT_HOTEL) -> Optional[PurchaseRequest]:
        obj = self.get(pr_id, hotel_id=hotel_id)
        if not obj:
            return None
        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def approve(self, pr_id: str, approved_by: str, hotel_id: str = DEFAULT_HOTEL) -> Optional[PurchaseRequest]:
        obj = self.get(pr_id, hotel_id=hotel_id)
        if not obj:
            return None
        obj.status = "approved"
        obj.approved_by = approved_by
        obj.approved_at = datetime.utcnow()
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def reject(self, pr_id: str, rejection_note: str, hotel_id: str = DEFAULT_HOTEL) -> Optional[PurchaseRequest]:
        obj = self.get(pr_id, hotel_id=hotel_id)
        if not obj:
            return None
        obj.status = "rejected"
        obj.rejection_note = rejection_note
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(obj)
        return obj
