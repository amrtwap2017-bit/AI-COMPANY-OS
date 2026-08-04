from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from .models import Employee

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class EmployeeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict, hotel_id: str = DEFAULT_HOTEL) -> Employee:
        obj = Employee(id=str(uuid.uuid4()), hotel_id=hotel_id,
            created_at=datetime.utcnow(), updated_at=datetime.utcnow(), **data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def list(self, hotel_id: str = DEFAULT_HOTEL, skip: int = 0, limit: int = 100,
             department: str = None, status: str = None) -> List[Employee]:
        q = self.db.query(Employee).filter(Employee.hotel_id == hotel_id, Employee.is_active == True)
        if department: q = q.filter(Employee.department == department)
        if status: q = q.filter(Employee.status == status)
        return q.order_by(Employee.name).offset(skip).limit(limit).all()

    def get(self, obj_id: str, hotel_id: str = DEFAULT_HOTEL) -> Optional[Employee]:
        return self.db.query(Employee).filter(
            Employee.id == obj_id, Employee.hotel_id == hotel_id).first()

    def update(self, obj_id: str, data: dict, hotel_id: str = DEFAULT_HOTEL) -> Optional[Employee]:
        obj = self.get(obj_id, hotel_id)
        if not obj: return None
        for k, v in data.items():
            if v is not None and k not in ("id", "hotel_id", "created_at"):
                setattr(obj, k, v)
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj_id: str, hotel_id: str = DEFAULT_HOTEL) -> bool:
        obj = self.get(obj_id, hotel_id)
        if not obj: return False
        obj.is_active = False
        self.db.commit()
        return True
