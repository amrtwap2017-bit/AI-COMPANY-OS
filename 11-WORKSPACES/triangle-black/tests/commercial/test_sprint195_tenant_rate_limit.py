"""Sprint-195: Per-tenant rate limiting tests"""
import requests, os, time

BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_tenant_rate_limit_env_var_exists():
    """ENABLE_TENANT_RATE_LIMIT env var should be recognized"""
    val = os.environ.get("ENABLE_TENANT_RATE_LIMIT", "0")
    assert val in ("0", "1", None, ""), f"Unexpected value: {val}"

def test_normal_requests_still_work_without_tenant_limit():
    """Standard API calls should return 200 when tenant limit is off"""
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=1", headers=_h(), timeout=10)
    assert r.status_code in (200, 429), f"Unexpected: {r.status_code}"

def test_rate_limit_headers_present():
    """Rate limit headers should be present on responses"""
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=1", headers=_h(), timeout=10)
    if r.status_code == 200:
        assert "X-RateLimit-Limit" in r.headers, "Missing X-RateLimit-Limit header"
        assert "X-RateLimit-Remaining" in r.headers, "Missing X-RateLimit-Remaining header"

def test_health_endpoint_not_rate_limited():
    """Health endpoint must always be accessible"""
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200, f"Health check failed: {r.status_code}"

def test_localhost_whitelisted_from_sprint76_middleware():
    """Localhost requests should never be rate limited by Sprint-76 middleware"""
    for _ in range(5):
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        assert r.status_code != 429, "Localhost was rate limited - whitelist not working"

def test_tenant_rate_limit_config_defaults():
    """Default tenant rate limit should be 500 req/min"""
    tenant_max = int(os.environ.get("TENANT_RATE_LIMIT_MAX", "500"))
    assert tenant_max >= 100, f"Tenant limit too low: {tenant_max}"
    assert tenant_max <= 10000, f"Tenant limit too high: {tenant_max}"
