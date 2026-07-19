"""Redis Cache Service — wired and working."""
import json
import redis
from typing import Any, Optional
from functools import wraps

_client: Optional[redis.Redis] = None

def get_redis() -> Optional[redis.Redis]:
    global _client
    if _client is None:
        try:
            _client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
            _client.ping()
        except Exception:
            _client = None
    return _client

def cache_get(key: str) -> Optional[Any]:
    r = get_redis()
    if r is None:
        return None
    try:
        val = r.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None

def cache_set(key: str, value: Any, ttl: int = 300) -> bool:
    r = get_redis()
    if r is None:
        return False
    try:
        r.setex(key, ttl, json.dumps(value, default=str))
        return True
    except Exception:
        return False

def cache_delete(key: str) -> bool:
    r = get_redis()
    if r is None:
        return False
    try:
        r.delete(key)
        return True
    except Exception:
        return False

def cache_flush_prefix(prefix: str) -> int:
    r = get_redis()
    if r is None:
        return 0
    keys = r.keys(f"{prefix}*")
    if keys:
        return r.delete(*keys)
    return 0

def cached(key_prefix: str, ttl: int = 300):
    """Decorator: cache function result in Redis."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{key_prefix}:{hash(str(args)+str(kwargs))}"
            cached_val = cache_get(cache_key)
            if cached_val is not None:
                return cached_val
            result = await func(*args, **kwargs)
            cache_set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator

def redis_status() -> dict:
    r = get_redis()
    if r is None:
        return {"status": "disconnected", "error": "Cannot connect to Redis"}
    try:
        info = r.info()
        return {
            "status": "connected",
            "version": info.get("redis_version"),
            "used_memory": info.get("used_memory_human"),
            "connected_clients": info.get("connected_clients"),
            "keys": r.dbsize(),
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
