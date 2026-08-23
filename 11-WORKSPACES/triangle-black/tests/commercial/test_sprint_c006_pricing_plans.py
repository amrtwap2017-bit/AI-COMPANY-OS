"""
Sprint C-006: SaaS Pricing, Packaging & Feature Tier Matrix Verification Test
"""
import pytest
import requests

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

def test_public_plans_matrix_endpoint():
    r = requests.get(f"{BASE}/api/v1/plans/matrix", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "plans" in data
    assert len(data["plans"]) == 3
    
    plan_ids = [p["id"] for p in data["plans"]]
    assert "foundation" in plan_ids
    assert "intelligence" in plan_ids
    assert "enterprise" in plan_ids

def test_tenant_entitlements_endpoint():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/plans/my-entitlements", headers=h, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "active_plan" in data
    assert "usage" in data
    assert "enabled_features" in data
    assert data["usage"]["assets_limit"] >= 150
