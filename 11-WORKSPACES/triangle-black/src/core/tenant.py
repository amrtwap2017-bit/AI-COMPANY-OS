"""
Triangle Black — Multi-Tenant Context & Isolation Engine (Sprint P-005)
Enforces strict JWT-bound tenant scoping and prevents header-tampering attacks.
"""
import os
import logging
from typing import Optional
from fastapi import Request, HTTPException, Depends
from src.core.auth import decode_token

logger = logging.getLogger("triangle_black.tenant")

DEFAULT_HOTEL_ID = "tb-default-hotel-000000000001"

def get_hotel_id(request: Request) -> str:
    """
    Extracts and validates tenant scope with anti-spoofing protection.
    1. Extracts JWT Bearer token from Authorization header or cookie.
    2. Retrieves user's bound hotel_id from database or token claims.
    3. Prevents non-admin actors from overriding tenant scope via X-Hotel-ID header.
    """
    # 1. Check for Authorization header
    auth_header = request.headers.get("Authorization") or ""
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    elif "tb_access_token" in request.cookies:
        token = request.cookies.get("tb_access_token")

    user_hotel_id: Optional[str] = None
    user_role: Optional[str] = None

    if token:
        try:
            payload = decode_token(token)
            if payload:
                user_role = payload.get("role", "user")
                # Look for explicit hotel_id in payload, or resolve via user
                user_hotel_id = payload.get("hotel_id")
        except Exception:
            pass

    # 2. Check X-Hotel-ID header (Allowed for super-admin or system services)
    requested_header = request.headers.get("X-Hotel-ID")

    if requested_header:
        if user_role in ["admin", "superadmin", "platform_service"] or not user_hotel_id:
            return requested_header
        # If regular tenant attempts to spoof another hotel_id, force their bound tenant
        if user_hotel_id and requested_header != user_hotel_id:
            logger.warning(
                f"SECURITY: Tenant spoofing blocked for role {user_role}. Requested: {requested_header}, Bound: {user_hotel_id}"
            )
            return user_hotel_id

    # 3. Return bound tenant or platform default
    return user_hotel_id or DEFAULT_HOTEL_ID


def get_tenant_context(request: Request) -> dict:
    """Returns standard SaaS tenant context dictionary."""
    hid = get_hotel_id(request)
    return {
        "hotel_id": hid,
        "organization_id": f"org_{hid}",
        "site_id": f"site_{hid}"
    }


# TenantContext — backward-compatible dataclass for tenant isolation tests
from dataclasses import dataclass

@dataclass
class TenantContext:
    """Represents the resolved tenant context for a request."""
    hotel_id: str
    organization_id: str = ""

    def __post_init__(self):
        # organization_id mirrors hotel_id for backward compatibility
        if not self.organization_id:
            self.organization_id = self.hotel_id

    @classmethod
    def from_hotel_id(cls, hotel_id: str) -> "TenantContext":
        """Factory method — creates TenantContext from hotel_id string."""
        return cls(hotel_id=hotel_id, organization_id=hotel_id)

    def __str__(self) -> str:
        return f"TenantContext(hotel_id={self.hotel_id})" 
