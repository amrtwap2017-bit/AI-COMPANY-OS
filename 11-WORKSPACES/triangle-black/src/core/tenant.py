"""
T-009: Tenant Compatibility Layer
Provides transparent transition from hotel_id → organization_id.

Architecture:
  Company
  └─ Organization (was: hotel)
     └─ Site (was: hotel location)
        └─ Building / Floor / Area / Asset

Current state: hotel_id is the active tenant key in JWT and all tables.
Migration: organization_id added as alias — hotel_id remains primary.
Future: organization_id becomes primary, hotel_id becomes legacy compat field.

Usage:
  from src.core.tenant import get_hotel_id, get_organization_id, TenantContext
"""
from typing import Optional
from fastapi import Header, HTTPException, status
import os

# Default hotel for development/testing
DEFAULT_HOTEL_ID = os.environ.get("DEFAULT_HOTEL_ID", "tb-default-hotel-000000000001")


def get_hotel_id(
    authorization: Optional[str] = Header(None),
    x_hotel_id: Optional[str] = Header(None, alias="X-Hotel-ID"),
) -> str:
    """
    Extract hotel_id from:
    1. JWT sub → user.hotel_id lookup (authoritative)
    2. X-Hotel-ID header (compatibility for internal services)
    3. Default hotel (development fallback)

    NEVER trust client-provided hotel_id in query params.
    """
    # Try JWT first
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1]
        hotel_id = _extract_hotel_from_jwt(token)
        if hotel_id:
            return hotel_id

    # Try X-Hotel-ID header (for internal service-to-service)
    if x_hotel_id:
        return x_hotel_id

    return DEFAULT_HOTEL_ID


def get_organization_id(
    authorization: Optional[str] = Header(None),
    x_hotel_id: Optional[str] = Header(None, alias="X-Hotel-ID"),
) -> str:
    """
    T-009: organization_id is currently an alias for hotel_id.
    When organization model is fully implemented this will diverge.
    """
    return get_hotel_id(authorization=authorization, x_hotel_id=x_hotel_id)


def _extract_hotel_from_jwt(token: str) -> Optional[str]:
    """Extract hotel_id from JWT payload."""
    try:
        import base64
        import json
        parts = token.split(".")
        if len(parts) != 3:
            return None
        # Decode payload (middle part)
        payload_b64 = parts[1]
        # Add padding
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        # JWT has sub (user email/id) — look up hotel_id from user
        return payload.get("hotel_id") or _lookup_hotel_from_sub(payload.get("sub"))
    except Exception:
        return None


def _lookup_hotel_from_sub(sub: Optional[str]) -> Optional[str]:
    """Look up hotel_id from user sub (email) via DB."""
    if not sub:
        return None
    try:
        from src.core.database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        try:
            row = db.execute(
                text("SELECT hotel_id FROM users WHERE email = :email LIMIT 1"),
                {"email": sub}
            ).fetchone()
            return row[0] if row else DEFAULT_HOTEL_ID
        finally:
            db.close()
    except Exception:
        return DEFAULT_HOTEL_ID


class TenantContext:
    """
    T-009: Structured tenant context object.
    Carries all tenant-related identifiers for a request.
    Prepared for future organization_id first-class support.
    """

    def __init__(self, hotel_id: str):
        self.hotel_id = hotel_id
        # organization_id is currently a 1:1 mapping to hotel_id
        # When organization model matures this will be a proper lookup
        self.organization_id = hotel_id
        # site_id is reserved for future location-level scoping
        self.site_id: Optional[str] = None

    def __repr__(self):
        return (
            f"TenantContext(hotel_id={self.hotel_id!r}, "
            f"organization_id={self.organization_id!r})"
        )

    @classmethod
    def from_hotel_id(cls, hotel_id: str) -> "TenantContext":
        return cls(hotel_id=hotel_id)

    def to_dict(self):
        return {
            "hotel_id": self.hotel_id,
            "organization_id": self.organization_id,
            "site_id": self.site_id,
        }


def get_tenant_context(
    authorization: Optional[str] = Header(None),
    x_hotel_id: Optional[str] = Header(None, alias="X-Hotel-ID"),
) -> TenantContext:
    """
    FastAPI dependency that returns full TenantContext.
    Use this when you need organization_id alongside hotel_id.
    """
    hotel_id = get_hotel_id(authorization=authorization, x_hotel_id=x_hotel_id)
    return TenantContext.from_hotel_id(hotel_id)
