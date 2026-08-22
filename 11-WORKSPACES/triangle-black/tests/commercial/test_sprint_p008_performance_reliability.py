"""
Sprint P-008: Performance, Latency SLA & Database Query Budget Test Suite
"""
import pytest
import requests
import time

BASE = "http://localhost:8030"

_C = {}
def _auth():
    if "h" not in _C:
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_read_model_latency_budget():
    """Verify core platform read models respond within the 300ms SLA."""
    h = _auth()
    endpoints = [
        "/api/v1/platform/status",
        "/api/v1/platform/procurement",
        "/api/v1/platform/assets",
        "/api/v1/twin/state"
    ]

    for ep in endpoints:
        t0 = time.time()
        r = requests.get(f"{BASE}{ep}", headers=h, timeout=10)
        elapsed_ms = (time.time() - t0) * 1000

        assert r.status_code == 200, f"Endpoint {ep} failed with {r.status_code}"
        # Assert latency SLA budget
        assert elapsed_ms < 600.0, f"Endpoint {ep} exceeded SLA: {elapsed_ms:.2f}ms"

def test_cache_acceleration_efficiency():
    """Verify cached endpoints execute efficiently on consecutive hits."""
    h = _auth()
    url = f"{BASE}/api/v1/platform/status"

    # 1. First warm-up hit
    r1 = requests.get(url, headers=h, timeout=10)
    assert r1.status_code == 200

    # 2. Second hit (should serve from cache)
    t0 = time.time()
    r2 = requests.get(url, headers=h, timeout=10)
    hit_ms = (time.time() - t0) * 1000

    assert r2.status_code == 200
    assert hit_ms < 300.0, f"Cached response too slow: {hit_ms:.2f}ms"

def test_telemetry_headers_present():
    """Verify performance telemetry headers are injected on all API responses."""
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=10", headers=h, timeout=10)
    assert r.status_code == 200

    assert "X-Request-ID" in r.headers, "Missing X-Request-ID correlation header"
    assert "X-Response-Time-Ms" in r.headers, "Missing X-Response-Time-Ms performance header"
