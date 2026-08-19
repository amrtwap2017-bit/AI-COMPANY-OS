"""T-012: Commercial Demo Tenant Tests"""
import pytest
import requests
from pathlib import Path

BASE = "http://localhost:8030"
ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")

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

def test_seed_script_exists():
    assert (ROOT / "scripts/seed_demo_tenant.py").exists()

def test_demo_guide_exists():
    assert (ROOT / "docs/DEMO-GUIDE.md").exists()

def test_demo_guide_has_login():
    text = (ROOT / "docs/DEMO-GUIDE.md").read_text()
    assert "demo@triangleblack.com" in text
    assert "tb-demo-hotel-000000000001" in text

def test_seed_has_hotel():
    text = (ROOT / "scripts/seed_demo_tenant.py").read_text()
    assert "seed_hotel" in text
    assert "tb-demo-hotel-000000000001" in text

def test_seed_has_assets():
    text = (ROOT / "scripts/seed_demo_tenant.py").read_text()
    assert "seed_assets" in text
    assert "HVAC" in text

def test_seed_has_work_orders():
    text = (ROOT / "scripts/seed_demo_tenant.py").read_text()
    assert "seed_work_orders" in text

def test_seed_has_suppliers():
    text = (ROOT / "scripts/seed_demo_tenant.py").read_text()
    assert "seed_suppliers" in text

def test_seed_has_invoices():
    text = (ROOT / "scripts/seed_demo_tenant.py").read_text()
    assert "seed_invoices" in text

def test_demo_constant_defined():
    text = (ROOT / "scripts/seed_demo_tenant.py").read_text()
    assert 'DEMO_HOTEL_ID = "tb-demo-hotel-000000000001"' in text

def test_demo_guide_has_pitch_points():
    text = (ROOT / "docs/DEMO-GUIDE.md").read_text()
    assert "Operational Transparency" in text
    assert "AI Assistance" in text

def test_platform_api_healthy():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    _s(r, "health")
    assert r.status_code == 200

def test_assets_endpoint_accessible():
    r = requests.get(f"{BASE}/api/v1/assets/?limit=5", timeout=5)
    _s(r, "assets")
    assert r.status_code in (200, 401)

def test_executive_kpi_accessible():
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/summary",
        headers=_h(), timeout=10)
    _s(r, "kpi")
    assert r.status_code == 200

def test_ai_gateway_accessible():
    r = requests.get(f"{BASE}/api/v1/ai-gateway/models", headers=_h(), timeout=5)
    _s(r, "ai")
    assert r.status_code == 200
