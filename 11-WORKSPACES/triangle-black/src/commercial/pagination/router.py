"""
Pagination FastAPI router — Triangle Black
Exposes pagination stats and log endpoints.
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import PaginationLogResponse
from .repository import PaginationLogRepository

router = APIRouter(prefix="/pagination", tags=["pagination"])


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Get pagination performance stats."""
    return PaginationLogRepository(db).get_stats(hotel_id=hotel_id)


@router.get("/logs", response_model=List[PaginationLogResponse])
def list_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """List pagination query logs."""
    return PaginationLogRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)
