from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models import Notification


class NotificationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> Notification:
        obj = Notification(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **data,
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, obj_id: str) -> Optional[Notification]:
        return self.db.query(Notification).filter(Notification.id == obj_id).first()

    def list_for_role(
        self,
        role: str,
        unread_only: bool = False,
        limit: int = 50,
    ) -> list[Notification]:
        q = self.db.query(Notification).filter(
            Notification.recipient_role.in_([role, "all"])
        )
        if unread_only:
            q = q.filter(Notification.is_read == False)
        return q.order_by(Notification.created_at.desc()).limit(limit).all()

    def unread_count(self, role: str) -> int:
        return (
            self.db.query(Notification)
            .filter(
                Notification.recipient_role.in_([role, "all"]),
                Notification.is_read == False,
            )
            .count()
        )

    def mark_read(self, obj_id: str) -> Optional[Notification]:
        obj = self.get(obj_id)
        if not obj:
            return None
        obj.is_read = True
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def mark_all_read(self, role: str) -> int:
        updated = (
            self.db.query(Notification)
            .filter(
                Notification.recipient_role.in_([role, "all"]),
                Notification.is_read == False,
            )
            .all()
        )
        for n in updated:
            n.is_read = True
            n.updated_at = datetime.utcnow()
        self.db.commit()
        return len(updated)

    def delete(self, obj_id: str) -> bool:
        obj = self.get(obj_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True
