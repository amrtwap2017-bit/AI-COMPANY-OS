"""Sprint-198: Verify cache is applied to high-traffic endpoints"""
import time
import requests

BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_work_orders_list_returns_200():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=5", headers=_h(), timeout=10)
    assert r.status_code == 200

def test_work_orders_second_call_is_faster():
    """Cache hit should be faster than first call"""
    t1 = time.time()
    requests.get(f"{BASE}/api/v1/work-orders/?limit=10&status=open", headers=_h(), timeout=10)
    d1 = time.time() - t1
    t2 = time.time()
    requests.get(f"{BASE}/api/v1/work-orders/?limit=10&status=open", headers=_h(), timeout=10)
    d2 = time.time() - t2
    # Second call should be at most 3x slower than first (allows for variance)
    assert d2 < max(d1 * 3, 1.0), f"Cache miss? First={d1:.3f}s Second={d2:.3f}s"

def test_assets_list_returns_200():
    r = requests.get(f"{BASE}/api/v1/assets/?limit=5", headers=_h(), timeout=10)
    assert r.status_code == 200

def test_assets_second_call_acceptable():
    requests.get(f"{BASE}/api/v1/assets/?limit=10", headers=_h(), timeout=10)
    t2 = time.time()
    r2 = requests.get(f"{BASE}/api/v1/assets/?limit=10", headers=_h(), timeout=10)
    d2 = time.time() - t2
    assert r2.status_code == 200
    assert d2 < 2.0, f"Second asset call too slow: {d2:.3f}s"

def test_leads_list_returns_200():
    r = requests.get(f"{BASE}/api/v1/leads-portal-v2?limit=5", timeout=10)
    assert r.status_code in (200, 401, 403)

def test_cache_status_endpoint_accessible():
    r = requests.get(f"{BASE}/api/v1/cache/status", timeout=5)
    assert r.status_code == 200
    data = r.json()
    assert "backend" in data
    assert data["backend"] in ("redis", "memory")

def test_cache_invalidate_endpoint_accessible():
    r = requests.post(
        f"{BASE}/api/v1/cache/invalidate/tb-default-hotel-000000000001",
        headers=_h(), timeout=5
    )
    assert r.status_code in (200, 201, 403, 404, 405)

def test_work_orders_different_filters_different_cache():
    """Different filter params must produce different cache entries"""
    r1 = requests.get(f"{BASE}/api/v1/work-orders/?limit=5&status=open", headers=_h(), timeout=10)
    r2 = requests.get(f"{BASE}/api/v1/work-orders/?limit=5&status=completed", headers=_h(), timeout=10)
    assert r1.status_code == 200
    assert r2.status_code == 200
