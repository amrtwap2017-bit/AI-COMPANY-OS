"""
app/auth/optional.py
────────────────────────────────────────────────────────────────
Optional authentication dependency.

Returns the current user if authenticated.
Returns None if no credentials provided.
Never blocks the request — the platform works without auth.

Use this on routes that should work anonymously but log
the caller when credentials are present.
"""

from __future__ import annotations

from fastapi import Request
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.db.user import User


def get_optional_user(
    request: Request,
) -> User | None:
    """
    Extract user from Authorization header if present.
    Returns None if no auth header or invalid token.
    Never raises.
    """
    try:
        auth_header = request.headers.get("Authorization", "")
        if not auth_header:
            return None

        if auth_header.startswith("Bearer "):
            token = auth_header.removeprefix("Bearer ")
            from app.auth.jwt import decode_token
            from app.db.database import SessionLocal
            payload = decode_token(token)
            if not payload:
                return None
            db = SessionLocal()
            try:
                user = db.query(User).filter(
                    User.id == payload.get("sub")
                ).first()
                return user
            finally:
                db.close()

        return None
    except Exception:
        return None
