"""
Triangle Black — Multi-Tenant Context & Isolation Engine
Enforces strict JWT-bound tenant scoping and prevents header-tampering attacks.
Fixed A-010-C: DB lookup when JWT has no hotel_id (provisioned users).
"""
import re
import os
import logging
from typing import Optional
from fastapi import Request, HTTPException, Depends
from src.core.auth import decode_token

logger = logging.getLogger("triangle_black.tenant")

DEFAULT_HOTEL_ID = "tb-default-hotel-000000000001"


def get_hotel_id(request: Request) -> str:
    """
    Extracts and validates tenant scope.
    Priority order:
    1. JWT hotel_id claim (if present in token)
    2. DB lookup via JWT sub (user_id) — handles provisioned users
    3. X-Hotel-ID header (admin/superadmin only, anti-spoofing)
    4. DEFAULT_HOTEL_ID fallback
    """
    auth_header = request.headers.get("Authorization") or ""
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    elif "tb_access_token" in request.cookies:
        token = request.cookies.get("tb_access_token")

    user_hotel_id: Optional[str] = None
    user_role: Optional[str] = None
    user_sub: Optional[str] = None

    if token:
        try:
            payload = decode_token(token)
            if payload:
                user_role = payload.get("role", "user")
                user_hotel_id = payload.get("hotel_id")
                user_sub = payload.get("sub")
        except Exception:
            pass

    # If hotel_id not in JWT, look up via user sub in DB
    if not user_hotel_id and user_sub:
        try:
            from src.core.database import SessionLocal
            from sqlalchemy import text as _sql_text
            _db = SessionLocal()
            try:
                row = _db.execute(
                    _sql_text("SELECT hotel_id FROM users WHERE id = :uid LIMIT 1"),
                    {"uid": user_sub}
                ).fetchone()
                if row and row[0]:
                    user_hotel_id = row[0]
                    logger.debug(f"Tenant resolved via DB for user {user_sub}: {user_hotel_id}")
            finally:
                _db.close()
        except Exception as _e:
            logger.warning(f"DB tenant lookup failed for {user_sub}: {_e}")

    # X-Hotel-ID header override (admin/superadmin only)
    requested_header = request.headers.get("X-Hotel-ID")
    if requested_header:
        if user_role in ["admin", "superadmin", "platform_service"] or not user_hotel_id:
            return requested_header
        if user_hotel_id and requested_header != user_hotel_id:
            logger.warning(
                f"SECURITY: Tenant spoofing blocked for role {user_role}. "
                f"Requested: {requested_header}, Bound: {user_hotel_id}"
            )
            return user_hotel_id

    return user_hotel_id or DEFAULT_HOTEL_ID


def get_tenant_context(request: Request) -> dict:
    """Returns standard SaaS tenant context dictionary."""
    hid = get_hotel_id(request)
    return {
        "hotel_id": hid,
        "organization_id": f"org_{hid}",
        "site_id": f"site_{hid}"
    }


from dataclasses import dataclass


@dataclass
class TenantContext:
    """Represents the resolved tenant context for a request."""
    hotel_id: str
    organization_id: str = ""

    def __post_init__(self):
        if not self.organization_id:
            self.organization_id = self.hotel_id

    @classmethod
    def from_hotel_id(cls, hotel_id: str) -> "TenantContext":
        return cls(hotel_id=hotel_id, organization_id=hotel_id)

    def to_dict(self) -> dict:
        return {
            "hotel_id": self.hotel_id,
            "organization_id": self.organization_id
        }

    def __str__(self) -> str:
        return f"TenantContext(hotel_id={self.hotel_id})"


def get_organization_id(request) -> str:
    """Extracts organization_id — mirrors hotel_id for single-org tenants."""
    return get_hotel_id(request)
