"""
Application Service for Suppliers Domain (Sprint U-003)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.commercial.suppliers.repository import SupplierRepository
from src.core.events import emit_event, EventType
from src.core.audit import audit_create, audit_update, audit_action

class SupplierService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"
        self.repo = SupplierRepository(db)

    def get_supplier(self, supplier_id: str) -> Optional[Dict[str, Any]]:
        s = self.repo.get_by_id(supplier_id, self.hotel_id)
        return getattr(s, "to_dict", lambda: dict(s.__dict__))() if s else None

    def list_suppliers(self, category: Optional[str] = None, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        return self.repo.list_suppliers(hotel_id=self.hotel_id, category=category, status=status, limit=limit, skip=skip)

    def create_supplier(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload["hotel_id"] = self.hotel_id
        s = self.repo.create(payload)
        sid = str(getattr(s, "id", ""))
        try:
            audit_create(self.db, "supplier", sid, self.actor, self.hotel_id)
            emit_event(
                db=self.db,
                hotel_id=self.hotel_id,
                event_type=EventType.SUPPLIER_CREATED,
                aggregate_type="supplier",
                aggregate_id=sid,
                payload={"company_name": payload.get("company_name"), "category": payload.get("category")},
                actor=self.actor,
            )
        except Exception:
            pass
        return getattr(s, "to_dict", lambda: dict(s.__dict__))()

    def update_rating(self, supplier_id: str, rating: float) -> Optional[Dict[str, Any]]:
        updated = self.repo.update(supplier_id, self.hotel_id, {"rating": rating, "updated_at": datetime.utcnow()})
        if updated:
            try:
                audit_action(self.db, "supplier", supplier_id, "RATE", self.actor, {"rating": rating})
                emit_event(
                    db=self.db,
                    hotel_id=self.hotel_id,
                    event_type=EventType.SUPPLIER_RATED,
                    aggregate_type="supplier",
                    aggregate_id=supplier_id,
                    payload={"rating": rating},
                    actor=self.actor,
                )
            except Exception:
                pass
        return getattr(updated, "to_dict", lambda: dict(updated.__dict__))() if updated else None
