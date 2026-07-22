from __future__ import annotations
"""
Sprint 20: Simple in-memory rate limiter for login endpoint.
Limits: 5 attempts per 15 minutes per IP address.
"""
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import Request, HTTPException

# In-memory store: {ip: [(timestamp, count)]}
_login_attempts: dict[str, list] = defaultdict(list)
MAX_ATTEMPTS = 5
WINDOW_MINUTES = 15


def check_login_rate_limit(request: Request) -> None:
    """Call this at the start of the login endpoint."""
    ip = request.client.host if request.client else "unknown"
    now = datetime.utcnow()
    window_start = now - timedelta(minutes=WINDOW_MINUTES)

    # Clean old entries
    _login_attempts[ip] = [
        ts for ts in _login_attempts[ip] if ts > window_start
    ]

    # Check limit
    if len(_login_attempts[ip]) >= MAX_ATTEMPTS:
        oldest = _login_attempts[ip][0]
        retry_after = int((oldest + timedelta(minutes=WINDOW_MINUTES) - now).total_seconds())
        raise HTTPException(
            status_code=429,
            detail={
                "error": "too_many_requests",
                "message": f"Too many login attempts. Try again in {retry_after} seconds.",
                "retry_after_seconds": max(retry_after, 1)
            }
        )

    _login_attempts[ip].append(now)


def clear_login_attempts(ip: str) -> None:
    """Call on successful login to reset the counter."""
    _login_attempts.pop(ip, None)
