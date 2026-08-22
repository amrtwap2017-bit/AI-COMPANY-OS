"""
Scope of Work Repository — Triangle Black Enterprise OS
Standard DDD Repository Pattern with strict hotel_id tenant scoping.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from src.commercial.scope_of_work.models import ScopeOfWork

class ScopeOfWorkRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_sow(
        self,
        hotel_id: str,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[ScopeOfWork]:
        query = self.db.query(ScopeOfWork).filter(
            ScopeOfWork.hotel_id == hotel_id,
            ScopeOfWork.deleted_at.is_(None) if hasattr(ScopeOfWork, "deleted_at") else True
        )
        if status:
            query = query.filter(ScopeOfWork.status == status)
        return query.order_by(ScopeOfWork.created_at.desc()).offset(offset).limit(limit).all()

    def get_by_id(self, sow_id: str, hotel_id: str) -> Optional[ScopeOfWork]:
        return self.db.query(ScopeOfWork).filter(
            ScopeOfWork.id == sow_id,
            ScopeOfWork.hotel_id == hotel_id,
            ScopeOfWork.deleted_at.is_(None) if hasattr(ScopeOfWork, "deleted_at") else True
        ).first()

    def create(self, hotel_id: str, data: Dict[str, Any]) -> ScopeOfWork:
        data["hotel_id"] = hotel_id
        sow = ScopeOfWork(**data)
        self.db.add(sow)
        self.db.commit()
        self.db.refresh(sow)
        return sow

    def update_status(self, sow_id: str, hotel_id: str, status: str, approved_by: Optional[str] = None) -> Optional[ScopeOfWork]:
        sow = self.get_by_id(sow_id, hotel_id)
        if not sow:
            return None
        sow.status = status
        if approved_by and hasattr(sow, "approved_by"):
            sow.approved_by = approved_by
        self.db.commit()
        self.db.refresh(sow)
        return sow

    def get_summary(self, hotel_id: str) -> Dict[str, Any]:
        base_query = self.db.query(ScopeOfWork).filter(
            ScopeOfWork.hotel_id == hotel_id,
            ScopeOfWork.deleted_at.is_(None) if hasattr(ScopeOfWork, "deleted_at") else True
        )
        total = base_query.count()
        draft = base_query.filter(ScopeOfWork.status == "draft").count()
        approved = base_query.filter(ScopeOfWork.status == "approved").count()

        return {
            "total_sow": total,
            "draft_sow": draft,
            "approved_sow": approved
        }
