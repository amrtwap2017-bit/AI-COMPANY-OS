from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.security import hash_password, verify_password
from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.auth.api_keys import generate_api_key
from app.auth.dependencies import get_current_user, require_admin
from app.db.database import get_db
from app.models.db.user import User
from app.models.db.api_key import APIKey
from app.schemas.auth import (
    UserCreate,
    UserResponse,
    TokenResponse,
    RefreshRequest,
    APIKeyCreate,
    APIKeyCreated,
    APIKeyResponse,
)
from app.core.config import settings

router = APIRouter()


# ─────────────────────────────────────────────────────
# Register
# ─────────────────────────────────────────────────────
@router.post("/auth/register", response_model=UserResponse)
def register(req: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""

    # Check existing
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(
            status_code=400,
            detail="Username already taken",
        )
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user = User(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        role="user",
        is_active=True,
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ─────────────────────────────────────────────────────
# Login
# ─────────────────────────────────────────────────────
@router.post("/auth/login", response_model=TokenResponse)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login with username and password. Returns JWT tokens."""
    user = db.query(User).filter(
        User.username == form.username
    ).first()

    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled",
        )

    token_data = {
        "sub": user.username,
        "user_id": user.id,
        "role": user.role,
        "is_admin": user.is_admin,
    }

    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# ─────────────────────────────────────────────────────
# Refresh Token
# ─────────────────────────────────────────────────────
@router.post("/auth/refresh", response_model=TokenResponse)
def refresh_token(
    req: RefreshRequest,
    db: Session = Depends(get_db),
):
    """Get a new access token using a refresh token."""
    payload = decode_token(req.refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    username = payload.get("sub")
    user = db.query(User).filter(
        User.username == username,
        User.is_active == True,
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    token_data = {
        "sub": user.username,
        "user_id": user.id,
        "role": user.role,
        "is_admin": user.is_admin,
    }

    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# ─────────────────────────────────────────────────────
# Current User
# ─────────────────────────────────────────────────────
@router.get("/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    return current_user


# ─────────────────────────────────────────────────────
# API Keys
# ─────────────────────────────────────────────────────
@router.post("/auth/api-keys", response_model=APIKeyCreated)
def create_api_key(
    req: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a new API key for the current user."""
    full_key, key_hash, key_prefix = generate_api_key()

    api_key = APIKey(
        user_id=current_user.id,
        name=req.name,
        key_hash=key_hash,
        key_prefix=key_prefix,
        permissions=req.permissions,
        is_active=True,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    return APIKeyCreated(
        id=api_key.id,
        name=api_key.name,
        key=full_key,
        key_prefix=key_prefix,
        permissions=api_key.permissions,
    )


@router.get("/auth/api-keys", response_model=list[APIKeyResponse])
def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all API keys for the current user."""
    keys = db.query(APIKey).filter(
        APIKey.user_id == current_user.id
    ).all()
    return [
        APIKeyResponse(
            id=k.id,
            name=k.name,
            key_prefix=k.key_prefix,
            permissions=k.permissions,
            is_active=k.is_active,
            created_at=k.created_at.isoformat(),
        )
        for k in keys
    ]


@router.delete("/auth/api-keys/{key_id}")
def revoke_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke an API key."""
    key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user.id,
    ).first()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    key.is_active = False
    db.commit()
    return {"message": f"API key {key_id} revoked"}


# ─────────────────────────────────────────────────────
# Admin — list users
# ─────────────────────────────────────────────────────
@router.get("/auth/users", response_model=list[UserResponse])
def list_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin only — list all users."""
    return db.query(User).all()
