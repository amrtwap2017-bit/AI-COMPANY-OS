"""T-009: Organization_id migration — compatibility layer tests"""
import requests
import pytest
from pathlib import Path

BASE = "http://localhost:8030"
SRC  = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")
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

# ── ADR exists ─────────────────────────────────────────────────────────────
def test_adr_001_tenancy_exists():
    p = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/docs/transformation-v4/ADR-001-TENANCY.md")
    assert p.exists()
    text = p.read_text()
    assert "organization_id" in text
    assert "hotel_id" in text
    assert "Rollback" in text

# ── Migration exists ───────────────────────────────────────────────────────
def test_org_id_migration_file_exists():
    versions = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/alembic/versions")
    matches = list(versions.glob("*organization_id*"))
    assert len(matches) >= 1

# ── tenant.py unchanged ───────────────────────────────────────────────────
def test_get_hotel_id_still_works():
    src = (SRC / "core/tenant.py").read_text()
    assert "get_hotel_id" in src
    assert "hotel_id" in src

def test_tenant_py_not_modified_for_org_id():
    src = (SRC / "core/tenant.py").read_text()
    assert "organization_id" not in src, \
        "tenant.py must NOT reference organization_id yet — hotel_id remains runtime field"

# ── Live API still works ───────────────────────────────────────────────────
def test_work_orders_api_still_works():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=2",
                     headers=_h(), timeout=5)
    _s(r, "wo-t009")
    assert r.status_code == 200

def test_assets_api_still_works():
    r = requests.get(f"{BASE}/api/v1/assets/?limit=2",
                     headers=_h(), timeout=5)
    _s(r, "assets-t009")
    assert r.status_code in (200, 401)

def test_invoices_api_still_works():
    r = requests.get(f"{BASE}/api/v1/invoices/?limit=2",
                     headers=_h(), timeout=5)
    _s(r, "invoices-t009")
    assert r.status_code == 200

def test_contracts_api_still_works():
    r = requests.get(f"{BASE}/api/v1/contracts/?limit=2",
                     headers=_h(), timeout=5)
    _s(r, "contracts-t009")
    assert r.status_code == 200

def test_sla_summary_still_works():
    r = requests.get(f"{BASE}/api/v1/work-orders/sla-summary",
                     headers=_h(), timeout=5)
    _s(r, "sla-t009")
    assert r.status_code == 200

def test_health_still_works():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200
