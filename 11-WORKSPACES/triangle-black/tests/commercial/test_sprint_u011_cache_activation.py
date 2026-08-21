"""
Tests for Sprint U-011: Redis Cache Activation
Covers: Caching on /platform/status, /platform/procurement, and /platform/assets
"""
import requests
import pytest
from pathlib import Path

BASE = "http://localhost:8030"
HOTEL = "tb-default-hotel-000000000001"

_C = {}
def _h():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_cache_keys_present_in_platform_status_router():
    p = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial/platform_status/router.py")
    assert p.exists()
    text = p.read_text()
    assert "cache_get" in text
    assert "cache_set" in text
    assert "make_cache_key" in text

def test_cached_platform_status_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/platform/status", headers=_h(), timeout=10)
    _s(r, "platform-status")
    assert r.status_code == 200
    assert "subsystems" in r.json()

def test_cached_procurement_dashboard_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/platform/procurement", headers=_h(), timeout=10)
    _s(r, "procurement")
    assert r.status_code == 200
    assert "purchase_orders" in r.json()

def test_cached_assets_dashboard_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/platform/assets", headers=_h(), timeout=10)
    _s(r, "assets")
    assert r.status_code == 200
    assert "assets" in r.json()
