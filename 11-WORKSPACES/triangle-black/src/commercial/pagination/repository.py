from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
PaginationLog repository — Triangle Black
Uses actual DB columns: id, hotel_id, data, skip, limit, total_count, created_at
"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import PaginationLog

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class PaginationLogRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def log(
        self, hotel_id: str, skip: int, limit: int, total: int, data: str = "{}"
    ) -> PaginationLog:
        obj = PaginationLog(
            id=str(uuid.uuid4()),
            hotel_id=hotel_id,
            data=data,
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
        return (
            self.db.query(PaginationLog)
            .filter(PaginationLog.hotel_id == hotel_id)
            .order_by(PaginationLog.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_stats(self, hotel_id: str = DEFAULT_HOTEL) -> dict:
        rows = (
            self.db.query(
                func.avg(PaginationLog.total_count).label("avg_total"),
                func.count(PaginationLog.id).label("query_count"),
                func.max(PaginationLog.total_count).label("max_total"),
            )
            .filter(PaginationLog.hotel_id == hotel_id)
            .first()
        )
        if not rows or rows.query_count == 0:
            return {"avg_total": 0.0, "queries": 0, "max_total": 0}
        return {
            "avg_total": round(float(rows.avg_total or 0), 1),
            "queries": rows.query_count,
            "max_total": rows.max_total or 0,
        }
