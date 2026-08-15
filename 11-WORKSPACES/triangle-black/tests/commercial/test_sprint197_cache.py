"""Sprint-197: Cache layer tests"""
import time
import pytest

def test_cache_module_importable():
    from src.core.cache import cache_get, cache_set, cache_delete, make_cache_key
    assert callable(cache_get)
    assert callable(cache_set)
    assert callable(cache_delete)
    assert callable(make_cache_key)

def test_cache_key_generation():
    from src.core.cache import make_cache_key
    k1 = make_cache_key("work-orders", "hotel-001", limit=10, status="open")
    k2 = make_cache_key("work-orders", "hotel-001", limit=10, status="open")
    k3 = make_cache_key("work-orders", "hotel-002", limit=10, status="open")
    assert k1 == k2, "Same params must produce same key"
    assert k1 != k3, "Different hotel must produce different key"
    assert "hotel-001" in k1
    assert k1.startswith("tb:")

def test_cache_hotel_isolation():
    from src.core.cache import make_cache_key
    k1 = make_cache_key("assets", "hotel-A")
    k2 = make_cache_key("assets", "hotel-B")
    assert k1 != k2, "Hotels must have isolated cache keys"

def test_cache_set_and_get():
    from src.core.cache import cache_set, cache_get, make_cache_key
    key = make_cache_key("test", "hotel-test", run=int(time.time()))
    cache_set(key, {"data": [1, 2, 3]}, ttl=10)
    result = cache_get(key)
    assert result is not None, "Cache should return set value"
    assert result["data"] == [1, 2, 3]

def test_cache_miss_returns_none():
    from src.core.cache import cache_get
    result = cache_get("tb:nonexistent:key:12345")
    assert result is None

def test_cache_delete():
    from src.core.cache import cache_set, cache_get, cache_delete, make_cache_key
    key = make_cache_key("test-delete", "hotel-test", run=int(time.time()))
    cache_set(key, {"value": 42}, ttl=30)
    assert cache_get(key) is not None
    cache_delete(key)
    assert cache_get(key) is None

def test_cache_ttl_expiry():
    from src.core.cache import cache_set, cache_get, make_cache_key
    key = make_cache_key("test-ttl", "hotel-test", run=int(time.time()))
    cache_set(key, {"expires": True}, ttl=1)
    assert cache_get(key) is not None
    time.sleep(1.1)
    result = cache_get(key)
    assert result is None, "Cache entry should have expired after TTL"

def test_cache_invalidate_hotel():
    from src.core.cache import cache_set, cache_get, cache_invalidate_hotel, make_cache_key
    k1 = make_cache_key("work-orders", "hotel-X", run=int(time.time()))
    k2 = make_cache_key("assets", "hotel-X", run=int(time.time()))
    k3 = make_cache_key("work-orders", "hotel-Y", run=int(time.time()))
    cache_set(k1, {"hotel": "X", "type": "wo"}, ttl=30)
    cache_set(k2, {"hotel": "X", "type": "asset"}, ttl=30)
    cache_set(k3, {"hotel": "Y", "type": "wo"}, ttl=30)
    cache_invalidate_hotel("hotel-X")
    assert cache_get(k1) is None, "hotel-X work-orders should be invalidated"
    assert cache_get(k2) is None, "hotel-X assets should be invalidated"
    assert cache_get(k3) is not None, "hotel-Y should NOT be invalidated"

def test_cache_status_returns_dict():
    from src.core.cache import cache_status
    s = cache_status()
    assert isinstance(s, dict)
    assert "backend" in s
    assert s["backend"] in ("redis", "memory")
    assert "redis_available" in s
    assert "memory_keys" in s

def test_cache_serialization_complex_types():
    from src.core.cache import cache_set, cache_get, make_cache_key
    from datetime import datetime
    key = make_cache_key("test-serial", "hotel-test", run=int(time.time()))
    data = {"items": [1, 2, 3], "count": 3, "timestamp": str(datetime.utcnow())}
    cache_set(key, data, ttl=10)
    result = cache_get(key)
    assert result["count"] == 3
    assert result["items"] == [1, 2, 3]
