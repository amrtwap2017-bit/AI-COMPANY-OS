"""
Rate Limiter
─────────────────────────────────────────────────────
Per-IP rate limiting using slowapi.
Default: 60 requests per minute.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"],
)
