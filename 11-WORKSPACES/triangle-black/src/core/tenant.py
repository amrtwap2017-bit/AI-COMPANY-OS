"""
Triangle Black — Tenant (Hotel) Isolation
Every authenticated request carries hotel context.
Inject get_hotel_id as a dependency in any endpoint that needs isolation.
"""
from __future__ import annotations
from typing import Optional
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import get_current_user
from src.commercial.auth.models import User
from src.commercial.hotels.models import Hotel

# Default hotel ID — used for backward compatibility
DEFAULT_HOTEL_ID = "tb-default-hotel-000000000001"


def get_hotel_id(
    x_hotel_id: Optional[str] = Header(None, alias="X-Hotel-ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> str:
    """
    Resolves the active hotel for this request.

    Priority:
    1. X-Hotel-ID header (explicit selection — for multi-hotel admin)
    2. user.hotel_id (user belongs to one hotel)
    3. DEFAULT_HOTEL_ID (backward compat)

    Validates the hotel exists and is active.
    """
    hotel_id = x_hotel_id or getattr(current_user, "hotel_id", None) or DEFAULT_HOTEL_ID

    hotel = db.query(Hotel).filter(
        Hotel.id == hotel_id,
        Hotel.is_active == True,
    ).first()

    if not hotel:
        raise HTTPException(
            status_code=404,
            detail=f"Hotel '{hotel_id}' not found or inactive",
        )

    return hotel_id


def get_hotel(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
) -> Hotel:
    """Returns the full Hotel object for the current request."""
    return db.query(Hotel).filter(Hotel.id == hotel_id).first()
