"""
Sprint C-003: Commercial Pilot Foundation Verification
"""
import pytest
import requests
from pathlib import Path

BASE = "http://localhost:8030"
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

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

def test_pilot_seed_script_exists():
    assert (PROJECT_ROOT / "scripts" / "seed_pilot_tenants.py").exists()

def test_pilot_config_router_exists():
    assert (PROJECT_ROOT / "src" / "commercial" / "pilot_config" / "router.py").exists()

def test_pilot_dashboard_endpoint():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/pilot/dashboard", headers=h, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["pilot_status"] == "active"
    assert "kpis" in data
    assert "total_assets" in data["kpis"]
    assert "pm_compliance_pct" in data["kpis"]

def test_onboarding_creates_valid_tenant():
    r = requests.post(
        f"{BASE}/api/v1/onboarding/provision",
        json={
            "org_name": "Test Pilot Corp",
            "property_name": "Test Pilot Hotel",
            "admin_email": "pilot@test.com",
            "admin_password": "TestPass2026!"
        },
        timeout=10
    )
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert data["hotel_id"].startswith("tb-hotel-")
