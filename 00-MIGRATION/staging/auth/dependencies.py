"""
FastAPI Auth Dependencies
─────────────────────────────────────────────────────
Inject into routes to protect endpoints.

Usage:
  @router.get("/protected")
  def protected(user = Depends(get_current_user)):
      return {"user": user.username}

  @router.get("/admin-only")
  def admin(user = Depends(require_admin)):
      return {"user": user.username}
"""

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import (
    OAuth2PasswordBearer,
    APIKeyHeader,
)
from sqlalchemy.orm import Session

from app.auth.jwt import decode_token
from app.auth.api_keys import hash_api_key
from app.db.database import get_db
from app.models.db.user import User
from app.models.db.api_key import APIKey

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
)

api_key_header = APIKeyHeader(
    name="X-API-Key",
    auto_error=False,
)


def _get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(
        User.username == username,
        User.is_active == True,
    ).first()


def _get_user_by_api_key(db: Session, api_key: str) -> User | None:
    key_hash = hash_api_key(api_key)
    db_key = db.query(APIKey).filter(
        APIKey.key_hash == key_hash,
        APIKey.is_active == True,
    ).first()
    if not db_key:
        return None
    return db.query(User).filter(
        User.id == db_key.user_id,
        User.is_active == True,
    ).first()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    api_key: str = Security(api_key_header),
    db: Session = Depends(get_db),
) -> User:
    """
    Accepts either JWT token or API key.
    """
    # Try API key first
    if api_key:
        user = _get_user_by_api_key(db, api_key)
        if user:
            return user

    # Try JWT token
    if token:
        payload = decode_token(token)
        if payload:
            username = payload.get("sub")
            if username:
                user = _get_user_by_username(db, username)
                if user:
                    return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user_optional(
    token: str = Depends(oauth2_scheme),
    api_key: str = Security(api_key_header),
    db: Session = Depends(get_db),
) -> User | None:
    """
    Returns user if authenticated, None if not.
    Use for routes that work with or without auth.
    """
    try:
        return get_current_user(token, api_key, db)
    except HTTPException:
        return None


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
