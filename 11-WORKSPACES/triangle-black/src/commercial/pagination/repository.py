"""
PaginationLog repository — Triangle Black
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models import PaginationLog

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class PaginationLogRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def log(self, hotel_id: str, endpoint: str, skip: int, limit: int, total: int) -> PaginationLog:
        """Log a paginated query for performance monitoring."""
        obj = PaginationLog(
            id=str(uuid.uuid4()),
            hotel_id=hotel_id,
            endpoint=endpoint,
            skip=skip,
            limit=limit,
            total_count=total,
            created_at=datetime.utcnow(),
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        hotel_id: str = DEFAULT_HOTEL,
        endpoint: Optional[str] = None,
    ) -> list[PaginationLog]:
        q = (
            self.db.query(PaginationLog)
            .filter(PaginationLog.hotel_id == hotel_id)
        )
        if endpoint:
            q = q.filter(PaginationLog.endpoint == endpoint)
        return q.order_by(PaginationLog.created_at.desc()).offset(skip).limit(limit).all()

    def get_stats(self, hotel_id: str = DEFAULT_HOTEL) -> dict:
        """Return average total_count per endpoint for performance analysis."""
        from sqlalchemy import func
        rows = (
            self.db.query(
                PaginationLog.endpoint,
                func.avg(PaginationLog.total_count).label("avg_total"),
                func.count(PaginationLog.id).label("query_count"),
            )
            .filter(PaginationLog.hotel_id == hotel_id)
            .group_by(PaginationLog.endpoint)
            .all()
        )
        return {
            r.endpoint: {"avg_total": round(float(r.avg_total), 1), "queries": r.query_count}
            for r in rows
        }
