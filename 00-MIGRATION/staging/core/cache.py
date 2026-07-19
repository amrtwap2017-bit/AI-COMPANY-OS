"""
app/core/cache.py
────────────────────────────────────────────────────────────────
In-process LRU response cache for agent outputs.

Reduces repeated identical queries from hitting Ollama.
Cache key: SHA-256(agent_name + model + message_normalised)
TTL: 1 hour (3600 seconds)
Max entries: 200

Usage:
    from app.core.cache import response_cache

    cached = response_cache.get(agent, model, message)
    if cached:
        return cached

    result = ollama_service.generate(...)
    response_cache.set(agent, model, message, result)
"""

from __future__ import annotations

import hashlib
import time
import logging
from threading import Lock

log = logging.getLogger(__name__)

_DEFAULT_TTL     = 3600   # 1 hour
_DEFAULT_MAX     = 200    # max cached entries


class ResponseCache:

    def __init__(
        self,
        ttl_seconds: int = _DEFAULT_TTL,
        max_entries: int = _DEFAULT_MAX,
    ) -> None:
        self._ttl   = ttl_seconds
        self._max   = max_entries
        self._store: dict[str, tuple[str, float]] = {}
        self._lock  = Lock()
        self._hits  = 0
        self._misses = 0

    def _key(
        self,
        agent_name: str,
        model: str,
        message: str,
    ) -> str:
        normalised = message.strip().lower()
        raw = f"{agent_name}:{model}:{normalised}"
        return hashlib.sha256(raw.encode()).hexdigest()[:32]

    def get(
        self,
        agent_name: str,
        model: str,
        message: str,
    ) -> str | None:
        key = self._key(agent_name, model, message)
        with self._lock:
            if key not in self._store:
                self._misses += 1
                return None
            value, expires_at = self._store[key]
            if time.time() > expires_at:
                del self._store[key]
                self._misses += 1
                return None
            self._hits += 1
            log.debug("Cache HIT for %s/%s", agent_name, model)
            return value

    def set(
        self,
        agent_name: str,
        model: str,
        message: str,
        response: str,
    ) -> None:
        key = self._key(agent_name, model, message)
        expires_at = time.time() + self._ttl
        with self._lock:
            if len(self._store) >= self._max:
                self._evict_oldest()
            self._store[key] = (response, expires_at)

    def invalidate(
        self,
        agent_name: str,
        model: str,
        message: str,
    ) -> None:
        key = self._key(agent_name, model, message)
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def stats(self) -> dict:
        with self._lock:
            total = self._hits + self._misses
            return {
                "entries": len(self._store),
                "hits": self._hits,
                "misses": self._misses,
                "hit_rate": round(self._hits / total * 100, 1) if total else 0.0,
                "ttl_seconds": self._ttl,
                "max_entries": self._max,
            }

    def _evict_oldest(self) -> None:
        """Remove the entry with the earliest expiry."""
        if not self._store:
            return
        oldest_key = min(
            self._store,
            key=lambda k: self._store[k][1],
        )
        del self._store[oldest_key]


# Module-level singleton
response_cache = ResponseCache()
