from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models import Invoice


class InvoiceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> Invoice:
        obj = Invoice(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **data,
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, obj_id: str) -> Optional[Invoice]:
        return self.db.query(Invoice).filter(Invoice.id == obj_id).first()

    def get_by_number(self, number: str) -> Optional[Invoice]:
        return self.db.query(Invoice).filter(
            Invoice.invoice_number == number
        ).first()

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        contract_id: Optional[str] = None,
    ) -> list[Invoice]:
        q = self.db.query(Invoice)
        if status:
            q = q.filter(Invoice.status == status)
        if contract_id:
            q = q.filter(Invoice.contract_id == contract_id)
        return q.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()

    def update(self, obj_id: str, data: dict) -> Optional[Invoice]:
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

    def count_for_contract(self, contract_id: str) -> int:
        return (
            self.db.query(Invoice)
            .filter(Invoice.contract_id == contract_id)
            .count()
        )

    def next_invoice_number(self) -> str:
        now = datetime.utcnow()
        prefix = f"TB-INV-{now.year}{now.month:02d}"
        count = (
            self.db.query(Invoice)
            .filter(Invoice.invoice_number.like(f"{prefix}%"))
            .count()
        )
        return f"{prefix}-{count + 1:04d}"
