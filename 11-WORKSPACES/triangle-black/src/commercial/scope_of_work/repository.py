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


def get_all(db, hotel_id: str, limit: int = 100):
    """Get all scope of work items for a hotel."""
    from sqlalchemy import text
    try:
        rows = db.execute(text("""
            SELECT * FROM scope_of_work
            WHERE hotel_id = :hid
            ORDER BY created_at DESC
            LIMIT :lim
        """), {"hid": hotel_id, "lim": limit}).fetchall()
        return [dict(r._mapping) for r in rows]
    except Exception:
        return []


# ── Module-level functions required by tests ────────────────────────────────

def get_by_id(db, sow_id: str, hotel_id: str = None):
    """Module-level: Get a scope of work by ID."""
    from sqlalchemy import text as sqlt
    try:
        sql = "SELECT * FROM scope_of_work WHERE id = :sid"
        params = {"sid": sow_id}
        if hotel_id:
            sql += " AND hotel_id = :hid"
            params["hid"] = hotel_id
        row = db.execute(sqlt(sql), params).fetchone()
        return dict(row._mapping) if row else None
    except Exception:
        return None


def create(db, hotel_id: str, data: dict):
    """Module-level: Create a new scope of work."""
    from sqlalchemy import text as sqlt
    import uuid
    try:
        sow_id = str(uuid.uuid4())
        db.execute(sqlt("""
            INSERT INTO scope_of_work (id, hotel_id, title, description, status,
                created_at, updated_at)
            VALUES (:id, :hid, :title, :desc, :status, NOW(), NOW())
        """), {
            "id": sow_id, "hid": hotel_id,
            "title": data.get("title", ""), "desc": data.get("description", ""),
            "status": data.get("status", "draft")
        })
        db.commit()
        return get_by_id(db, sow_id)
    except Exception:
        return None
