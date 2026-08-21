"""
Application Service for Suppliers Domain (Sprint U-003)
Uses functional repository exports from suppliers/repository.py.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
import src.commercial.suppliers.repository as supplier_repo
from src.core.events import emit_event, EventType
from src.core.audit import audit_create, audit_action

class SupplierService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"

    def get_supplier(self, supplier_id: str) -> Optional[Dict[str, Any]]:
        return supplier_repo.get_by_id(self.db, supplier_id, self.hotel_id)

    def list_suppliers(self, category: Optional[str] = None, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        # Map parameters to get_all functional signature
        res = supplier_repo.get_all(self.db, self.hotel_id, status=status, limit=limit, offset=skip)
        return res.get("results", [])

    def create_supplier(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        s = supplier_repo.create(self.db, payload, self.hotel_id)
        sid = str(s.get("id") if s else "")
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
        return s

    def update_rating(self, supplier_id: str, rating: float) -> Optional[Dict[str, Any]]:
        updated = supplier_repo.update(self.db, supplier_id, self.hotel_id, {"rating": rating})
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
        return updated
