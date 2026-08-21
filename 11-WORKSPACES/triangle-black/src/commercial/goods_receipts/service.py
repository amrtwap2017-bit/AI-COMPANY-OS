"""
Application Service for Goods Receipts Domain (Sprint U-003)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.commercial.goods_receipts.repository import GoodsReceiptRepository
from src.core.events import emit_event, EventType
from src.core.audit import audit_create

class GoodsReceiptService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"
        self.repo = GoodsReceiptRepository(db)

    def get_by_id(self, grn_id: str) -> Optional[Dict[str, Any]]:
        grn = self.repo.get_by_id(grn_id, self.hotel_id)
        return getattr(grn, "to_dict", lambda: dict(grn.__dict__))() if grn else None

    def list_receipts(self, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        return self.repo.list_receipts(hotel_id=self.hotel_id, status=status, limit=limit, skip=skip)

    def create_receipt(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload["hotel_id"] = self.hotel_id
        grn = self.repo.create(payload)
        grn_id = str(getattr(grn, "id", ""))
        try:
            audit_create(self.db, "goods_receipt", grn_id, self.actor, self.hotel_id)
            emit_event(
                db=self.db,
                hotel_id=self.hotel_id,
                event_type=EventType.GR_CREATED,
                aggregate_type="goods_receipt",
                aggregate_id=grn_id,
                payload={"purchase_order_id": payload.get("purchase_order_id"), "warehouse_id": payload.get("warehouse_id")},
                actor=self.actor,
            )
        except Exception:
            pass
        return getattr(grn, "to_dict", lambda: dict(grn.__dict__))()
