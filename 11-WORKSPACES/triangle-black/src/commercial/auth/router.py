import os
from __future__ import annotations

from src.commercial.auth.models import User

from datetime import datetime

from datetime import datetime
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    get_current_user, require_admin,
)

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterIn(BaseModel):
    name: str
    email: str
    password: str
    role: str = "agent"

class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str
    role: str

class RefreshIn(BaseModel):
    refresh_token: str

class ProfileOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

@router.post("/register", response_model=TokenOut, status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=str(uuid.uuid4()),
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(
        access_token=create_access_token(user.id, user.email, user.role),
        refresh_token=create_refresh_token(user.id),
        user_id=user.id, name=user.name, email=user.email, role=user.role,
    )

@router.post("/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password",
                            headers={"WWW-Authenticate": "Bearer"})
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")
    return TokenOut(
        access_token=create_access_token(user.id, user.email, user.role),
        refresh_token=create_refresh_token(user.id),
        user_id=user.id, name=user.name, email=user.email, role=user.role,
    )

@router.post("/refresh", response_model=TokenOut)
def refresh(payload: RefreshIn, db: Session = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == data["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return TokenOut(
        access_token=create_access_token(user.id, user.email, user.role),
        refresh_token=create_refresh_token(user.id),
        user_id=user.id, name=user.name, email=user.email, role=user.role,
    )

@router.get("/me", response_model=ProfileOut)
def me(current_user: User = Depends(get_current_user)):
    return ProfileOut(
        id=current_user.id, name=current_user.name, email=current_user.email,
        role=current_user.role, is_active=current_user.is_active,
        created_at=current_user.created_at,
    )

@router.post("/logout")
def logout():
    return {"ok": True, "message": "Logged out. Discard your token."}

# Simple in-memory rate limiter for login
import time
_login_attempts: dict = {}
_MAX_ATTEMPTS = 20
_LOCKOUT_SECONDS = 60  # 1 minute (dev-friendly)

def _check_rate_limit(identifier: str):
    if os.environ.get("DISABLE_RATE_LIMIT") == "1":
        return
    now = time.time()
    if identifier in _login_attempts:
        attempts, last_time = _login_attempts[identifier]
        if attempts >= _MAX_ATTEMPTS and (now - last_time) < _LOCKOUT_SECONDS:
            raise HTTPException(status_code=429, detail=f'Too many login attempts. Try again in {int(_LOCKOUT_SECONDS - (now-last_time)//60)} minutes.')
        if (now - last_time) >= _LOCKOUT_SECONDS:
            _login_attempts[identifier] = (0, now)

def _record_attempt(identifier: str, success: bool):
    if success:
        _login_attempts.pop(identifier, None)
    else:
        attempts, last = _login_attempts.get(identifier, (0, time.time()))
        _login_attempts[identifier] = (attempts + 1, time.time())
