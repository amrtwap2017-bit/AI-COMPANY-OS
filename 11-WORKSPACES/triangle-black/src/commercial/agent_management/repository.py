from __future__ import annotations
import uuid
from sqlalchemy.orm import Session
from src.commercial.agent_management.models import Agent


class AgentRepository:
    def __init__(self, db: Session) -> None: self.db = db

    def create(self, data: dict) -> Agent:
        data.setdefault("hotel_id", "tb-default-hotel-000000000001")
        obj = Agent(id=str(uuid.uuid4()), created_at=datetime.utcnow(), updated_at=datetime.utcnow(),
                     **{k: v for k, v in data.items() if k not in ("id", "created_at", "updated_at")})
        self.db.add(obj); self.db.commit(); self.db.refresh(obj); return obj

    def get(self, obj_id: str, hotel_id: str = "tb-default-hotel-000000000001") -> Optional[Agent]:
        return self.db.query(Agent).filter(Agent.id == obj_id, Agent.hotel_id == hotel_id).first()

    def list(self, skip=0, limit=100, hotel_id: str = "tb-default-hotel-000000000001") -> list[Agent]:
        return self.db.query(Agent).filter(Agent.hotel_id == hotel_id).order_by(Agent.created_at.desc()).offset(skip).limit(limit).all()

    def update(self, obj_id: str, data: dict, hotel_id: str = "tb-default-hotel-000000000001") -> Optional[Agent]:
        obj = self.get(obj_id, hotel_id=hotel_id)
        if not obj: return None
        for k, v in data.items():
            if v is not None and k not in ("id", "hotel_id", "created_at"): setattr(obj, k, v)
        self.db.commit(); self.db.refresh(obj); return obj

    def delete(self, obj_id: str, hotel_id: str = "tb-default-hotel-000000000001") -> None:
        obj = self.get(obj_id, hotel_id=hotel_id)
        if obj: self.db.delete(obj); self.db.commit()