from __future__ import annotations
import uuid
import hashlib
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()

    def create(self, data: dict) -> User:
        password = data.pop("password", "")
        obj = User(
            id=str(uuid.uuid4()),
            hashed_password=self._hash_password(password),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **data,
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, obj_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == obj_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def list(self, skip: int = 0, limit: int = 100) -> list[User]:
        return self.db.query(User).offset(skip).limit(limit).all()

    def update(self, obj_id: str, data: dict) -> Optional[User]:
        obj = self.get(obj_id)
        if not obj:
            return None
        if "password" in data:
            data["hashed_password"] = self._hash_password(data.pop("password"))
        for k, v in data.items():
            if v is not None:
                setattr(obj, k, v)
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj_id: str) -> bool:
        obj = self.get(obj_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True
