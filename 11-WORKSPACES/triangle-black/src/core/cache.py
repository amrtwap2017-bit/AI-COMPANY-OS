"""
Triangle Black — Response Cache Layer (Sprint-197)
Uses Redis when available, falls back to in-memory TTL dict.
Zero configuration required — just works in both dev and production.

Production activation:
  REDIS_URL=redis://localhost:6379/0 uvicorn ...

In-memory fallback is used when Redis is not reachable.
Cache is hotel_id-scoped — tenants never share cached data.
"""
from __future__ import annotations
import os
import time
import json
import hashlib
import logging
from typing import Any, Optional
from collections import defaultdict

logger = logging.getLogger(__name__)

# ── In-memory fallback store ──────────────────────────────────────────────────
_mem_store: dict = {}  # key -> (value, expires_at)

def _mem_get(key: str) -> Optional[Any]:
    entry = _mem_store.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        del _mem_store[key]
        return None
    return value

def _mem_set(key: str, value: Any, ttl: int) -> None:
    _mem_store[key] = (value, time.time() + ttl)

def _mem_delete(key: str) -> None:
    _mem_store.pop(key, None)

def _mem_delete_pattern(pattern: str) -> None:
    prefix = pattern.rstrip("*")
    keys = [k for k in list(_mem_store.keys()) if k.startswith(prefix)]
    for k in keys:
        del _mem_store[k]

# ── Redis connection (optional) ───────────────────────────────────────────────
_redis_client = None
_redis_available = False

def _get_redis():
    global _redis_client, _redis_available
    if _redis_client is not None:
        return _redis_client if _redis_available else None
    redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
    try:
        import redis as _redis
        client = _redis.from_url(redis_url, socket_connect_timeout=1, socket_timeout=1)
        client.ping()
        _redis_client = client
        _redis_available = True
        logger.info(f"[cache] Redis connected: {redis_url}")
    except Exception as e:
        _redis_client = None
        _redis_available = False
        logger.info(f"[cache] Redis not available ({e}) — using in-memory fallback")
    return _redis_client if _redis_available else None

# ── Public cache API ──────────────────────────────────────────────────────────
def make_cache_key(prefix: str, hotel_id: str, **kwargs) -> str:
    parts = json.dumps(kwargs, sort_keys=True, default=str)
    digest = hashlib.md5(parts.encode()).hexdigest()[:12]
    return f"tb:{hotel_id}:{prefix}:{digest}"

def cache_get(key: str) -> Optional[Any]:
    r = _get_redis()
    if r:
        try:
            raw = r.get(key)
            if raw:
                return json.loads(raw)
            return None
        except Exception:
            pass
    return _mem_get(key)

def cache_set(key: str, value: Any, ttl: int = 60) -> None:
    r = _get_redis()
    if r:
        try:
            r.setex(key, ttl, json.dumps(value, default=str))
            return
        except Exception:
            pass
    _mem_set(key, value, ttl)

def cache_delete(key: str) -> None:
    r = _get_redis()
    if r:
        try:
            r.delete(key)
        except Exception:
            pass
    _mem_delete(key)

def cache_invalidate_hotel(hotel_id: str) -> None:
    pattern = f"tb:{hotel_id}:*"
    r = _get_redis()
    if r:
        try:
            keys = r.keys(pattern)
            if keys:
                r.delete(*keys)
            return
        except Exception:
            pass
    _mem_delete_pattern(pattern)

def cache_status() -> dict:
    r = _get_redis()
    mem_count = len(_mem_store)
    return {
        "backend": "redis" if r else "memory",
        "redis_available": _redis_available,
        "memory_keys": mem_count,
    }
