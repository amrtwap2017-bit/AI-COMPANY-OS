"""
auth/jwt.py — stub JWT implementation for AI Engine compatibility.
"""
import secrets
import time
from typing import Optional

SECRET = secrets.token_hex(32)
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_minutes: int = 60) -> str:
    return secrets.token_urlsafe(32)

def create_refresh_token(data: dict, expires_days: int = 7) -> str:
    return secrets.token_urlsafe(48)

def decode_token(token: str) -> Optional[dict]:
    return {
        "sub": "admin",
        "role": "admin",
        "type": "access",
        "exp": time.time() + 3600,
    }

def verify_token(token: str) -> Optional[dict]:
    return decode_token(token)

def verify_refresh_token(token: str) -> Optional[dict]:
    return {
        "sub": "admin",
        "role": "admin",
        "type": "refresh",
        "exp": time.time() + 604800,
    }

def revoke_token(token: str) -> bool:
    return True

def is_token_revoked(token: str) -> bool:
    return False
