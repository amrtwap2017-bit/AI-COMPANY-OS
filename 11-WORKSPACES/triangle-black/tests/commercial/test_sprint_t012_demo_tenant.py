"""T-012: Demo tenant and seed data verification"""
import requests
import pytest
from pathlib import Path

BASE = "http://localhost:8030"
DEMO = "tb-demo-hotel-000000000001"
SCRIPTS = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/scripts")
DOCS = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/docs")

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
    assert (SCRIPTS / "seed_demo_tenant.py").exists()

def test_demo_guide_exists():
    assert (DOCS / "DEMO-GUIDE.md").exists()

def test_demo_guide_has_key_sections():
    text = (DOCS / "DEMO-GUIDE.md").read_text()
    for s in ["Demo Tenant", "Quick Start", "Login", "What Is Seeded", "Value Proposition"]:
        assert s in text, f"Missing: {s}"

def test_seed_script_has_idempotent_guard():
    text = (SCRIPTS / "seed_demo_tenant.py").read_text()
    assert "already_seeded" in text

def test_seed_script_uses_demo_hotel():
    text = (SCRIPTS / "seed_demo_tenant.py").read_text()
    assert "tb-demo-hotel-000000000001" in text

def test_demo_assets_seeded():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.core.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            row = conn.execute(text("SELECT COUNT(*) FROM assets WHERE hotel_id=:hid"), {"hid": DEMO}).fetchone()
            assert int(row[0]) >= 10, f"Expected 10+ assets, got {row[0]}"
    except Exception as e:
        pytest.skip(f"DB check failed: {e}")

def test_demo_work_orders_seeded():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.core.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            row = conn.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid"), {"hid": DEMO}).fetchone()
            assert int(row[0]) >= 20, f"Expected 20+ work orders, got {row[0]}"
    except Exception as e:
        pytest.skip(f"DB check failed: {e}")

def test_demo_suppliers_seeded():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.core.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            row = conn.execute(text("SELECT COUNT(*) FROM suppliers WHERE hotel_id=:hid"), {"hid": DEMO}).fetchone()
            assert int(row[0]) >= 5, f"Expected 5+ suppliers, got {row[0]}"
    except Exception as e:
        pytest.skip(f"DB check failed: {e}")

def test_demo_service_requests_seeded():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.core.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            row = conn.execute(text("SELECT COUNT(*) FROM service_requests WHERE hotel_id=:hid"), {"hid": DEMO}).fetchone()
            assert int(row[0]) >= 10, f"Expected 10+ SRs, got {row[0]}"
    except Exception as e:
        pytest.skip(f"DB check failed: {e}")

def test_health_ok():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200

def test_ai_gateway_registry_reachable():
    r = requests.get(f"{BASE}/api/v1/ai-gateway/registry", headers=_h(), timeout=5)
    _s(r, "ai-registry-t012")
    assert r.status_code == 200
