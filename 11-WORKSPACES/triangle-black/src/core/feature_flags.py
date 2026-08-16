"""
Triangle Black — Feature Flags (Sprint-201)
Simple in-memory TTL cache of tenant feature flags.

Usage:
    from src.core.feature_flags import is_feature_enabled, get_all_flags

    if is_feature_enabled("tb-default-hotel-000000000001", "ai_assistant"):
        # run AI logic

Flags are loaded from the tenant_feature_flags table.
Cache TTL: 300s (5 minutes) — safe for feature flag changes.
"""
from __future__ import annotations
import time
import logging
from typing import Any, Dict, Optional

logger = logging.getLogger("tb.feature_flags")

# ── In-memory flag cache ──────────────────────────────────────────────────────
_flag_cache: Dict[str, tuple] = {}  # hotel_id -> (flags_dict, expires_at)
_FLAG_TTL = 300  # seconds

# ── Default flags for safety ──────────────────────────────────────────────────
_DEFAULT_FLAGS: Dict[str, bool] = {
    "ai_assistant":    True,
    "analytics":       True,
    "client_portal":   True,
    "commercial":      True,
    "maintenance":     True,
    "operations":      True,
    "projects":        True,
    "supplier_portal": True,
    "supply_chain":    True,
}

def _load_flags_from_db(hotel_id: str) -> Dict[str, bool]:
    """Load feature flags from DB for a hotel. Returns defaults on error."""
    try:
        import os
        from sqlalchemy import text, create_engine
        from sqlalchemy.orm import Session
        db_url = os.environ.get("DATABASE_URL", "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black")
        eng = create_engine(db_url, pool_pre_ping=True)
        with Session(eng) as db:
            rows = db.execute(text("""
                SELECT ff.feature, ff.is_enabled
                FROM tenant_feature_flags ff
                JOIN tenants t ON t.id = ff.tenant_id
                WHERE t.hotel_id = :hotel_id
            """), {"hotel_id": hotel_id}).fetchall()
            if rows:
                return {r.feature: bool(r.is_enabled) for r in rows}
    except Exception as e:
        logger.warning(f"[feature_flags] DB load failed for {hotel_id}: {e}")
    return dict(_DEFAULT_FLAGS)

def _get_flags(hotel_id: str) -> Dict[str, bool]:
    """Get flags from cache or DB."""
    now = time.time()
    cached = _flag_cache.get(hotel_id)
    if cached and cached[1] > now:
        return cached[0]
    flags = _load_flags_from_db(hotel_id)
    _flag_cache[hotel_id] = (flags, now + _FLAG_TTL)
    return flags

def is_feature_enabled(hotel_id: str, feature: str) -> bool:
    """Check if a feature is enabled for a hotel. Returns True by default."""
    flags = _get_flags(hotel_id)
    return flags.get(feature, _DEFAULT_FLAGS.get(feature, True))

def get_all_flags(hotel_id: str) -> Dict[str, bool]:
    """Get all feature flags for a hotel."""
    return dict(_get_flags(hotel_id))

def invalidate_flags(hotel_id: str) -> None:
    """Invalidate cached flags for a hotel (call after flag changes)."""
    _flag_cache.pop(hotel_id, None)

def invalidate_all_flags() -> None:
    """Invalidate all cached flags."""
    _flag_cache.clear()

def override_flag(hotel_id: str, feature: str, enabled: bool) -> None:
    """Override a flag in cache (for testing only)."""
    flags = dict(_get_flags(hotel_id))
    flags[feature] = enabled
    _flag_cache[hotel_id] = (flags, time.time() + _FLAG_TTL)
