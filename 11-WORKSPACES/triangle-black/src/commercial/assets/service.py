"""
Application Service for Assets Domain (Sprint U-003)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.commercial.assets.repository import AssetRepository
from src.core.events import emit_event, EventType
from src.core.audit import audit_create, audit_update, audit_delete

class AssetService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"
        self.repo = AssetRepository(db)

    def get_asset(self, asset_id: str) -> Optional[Dict[str, Any]]:
        asset = self.repo.get_by_id(asset_id, self.hotel_id)
        return asset.to_dict() if hasattr(asset, "to_dict") else (dict(asset.__dict__) if asset else None)

    def list_assets(self, category: Optional[str] = None, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        return self.repo.list_assets(hotel_id=self.hotel_id, category=category, status=status, limit=limit, skip=skip)

    def create_asset(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload["hotel_id"] = self.hotel_id
        asset = self.repo.create(payload)
        asset_id = str(getattr(asset, "id", ""))

        # Non-blocking audit & domain event
        try:
            audit_create(self.db, "asset", asset_id, self.actor, self.hotel_id)
            emit_event(
                db=self.db,
                hotel_id=self.hotel_id,
                event_type=EventType.ASSET_CREATED,
                aggregate_type="asset",
                aggregate_id=asset_id,
                payload={"name": payload.get("name"), "criticality": payload.get("criticality")},
                actor=self.actor,
            )
        except Exception:
            pass

        return getattr(asset, "to_dict", lambda: dict(asset.__dict__))()

    def update_asset(self, asset_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        asset = self.repo.update(asset_id, self.hotel_id, updates)
        if asset:
            try:
                audit_update(self.db, "asset", asset_id, self.actor, self.hotel_id, updates)
                emit_event(
                    db=self.db,
                    hotel_id=self.hotel_id,
                    event_type=EventType.ASSET_UPDATED,
                    aggregate_type="asset",
                    aggregate_id=asset_id,
                    payload=updates,
                    actor=self.actor,
                )
            except Exception:
                pass
        return getattr(asset, "to_dict", lambda: dict(asset.__dict__))() if asset else None

    def record_failure(self, asset_id: str, reason: str) -> bool:
        res = self.update_asset(asset_id, {"status": "In Fault", "notes": f"Failure reported: {reason}"})
        if res:
            try:
                emit_event(
                    db=self.db,
                    hotel_id=self.hotel_id,
                    event_type=EventType.ASSET_FAILURE,
                    aggregate_type="asset",
                    aggregate_id=asset_id,
                    payload={"reason": reason, "status": "In Fault"},
                    actor=self.actor,
                )
            except Exception:
                pass
            return True
        return False
