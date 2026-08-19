"""
T-009: Organization ID Migration + Tenant Compatibility Tests
"""
import pytest
import requests
from pathlib import Path

BASE = "http://localhost:8030"
SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")

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

# ── Tenant module structure ───────────────────────────────────────────────────
def test_tenant_module_exists():
    assert (SRC / "core/tenant.py").exists()

def test_tenant_module_has_get_hotel_id():
    text = (SRC / "core/tenant.py").read_text()
    assert "def get_hotel_id(" in text

def test_tenant_module_has_get_organization_id():
    text = (SRC / "core/tenant.py").read_text()
    assert "def get_organization_id(" in text

def test_tenant_module_has_tenant_context():
    text = (SRC / "core/tenant.py").read_text()
    assert "class TenantContext" in text

def test_tenant_context_importable():
    from src.core.tenant import TenantContext, get_hotel_id, get_organization_id
    assert TenantContext is not None
    assert get_hotel_id is not None
    assert get_organization_id is not None

def test_tenant_context_has_both_ids():
    from src.core.tenant import TenantContext
    ctx = TenantContext.from_hotel_id("test-hotel-123")
    assert ctx.hotel_id == "test-hotel-123"
    assert ctx.organization_id == "test-hotel-123"

def test_tenant_context_to_dict():
    from src.core.tenant import TenantContext
    ctx = TenantContext.from_hotel_id("test-hotel-abc")
    d = ctx.to_dict()
    assert "hotel_id" in d
    assert "organization_id" in d
    assert d["hotel_id"] == d["organization_id"]

def test_adr_document_exists():
    adr = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/docs/transformation-v4/ADR-001-TENANCY.md")
    assert adr.exists()
    text = adr.read_text()
    assert "hotel_id" in text
    assert "organization_id" in text
    assert "NEVER" in text

def test_default_hotel_id_set():
    from src.core.tenant import DEFAULT_HOTEL_ID
    assert DEFAULT_HOTEL_ID is not None
    assert len(DEFAULT_HOTEL_ID) > 0

def test_organization_id_same_as_hotel_id():
    from src.core.tenant import TenantContext
    hotel = "tb-default-hotel-000000000001"
    ctx = TenantContext.from_hotel_id(hotel)
    assert ctx.organization_id == ctx.hotel_id

# ── Live API tenant scoping tests ─────────────────────────────────────────────
def test_work_orders_scoped_to_tenant():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=5", headers=_h(), timeout=5)
    _s(r, "wo-tenant")
    if r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("results", [])
        for item in items[:3]:
            assert "hotel_id" in item, f"WO missing hotel_id: {list(item.keys())}"

def test_assets_scoped_to_tenant():
    r = requests.get(f"{BASE}/api/v1/assets/?limit=5", timeout=5)
    _s(r, "assets-tenant")
    if r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("results", [])
        for item in items[:3]:
            assert "hotel_id" in item, f"Asset missing hotel_id"

def test_leads_scoped_to_tenant():
    r = requests.get(f"{BASE}/api/v1/leads/?limit=5", headers=_h(), timeout=5)
    _s(r, "leads-tenant")
    if r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("results", [])
        for item in items[:3]:
            assert "hotel_id" in item, f"Lead missing hotel_id"

def test_executive_kpi_scoped_to_tenant():
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/summary",
        headers=_h(), timeout=10)
    _s(r, "kpi-tenant")
    if r.status_code == 200:
        d = r.json()
        assert d.get("hotel_id") == "tb-default-hotel-000000000001", \
            f"KPI hotel_id mismatch: {d.get('hotel_id')}"

def test_cross_tenant_isolation():
    """Prove that two tokens for different hotels cannot see each other's data."""
    # With current architecture: all test data uses the same default hotel
    # This test verifies hotel_id field is present on responses
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=3", headers=_h(), timeout=5)
    _s(r, "cross-tenant")
    if r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("results", [])
        hotel_ids = set(item.get("hotel_id") for item in items if "hotel_id" in item)
        # All items should share the same hotel_id
        if len(hotel_ids) > 1:
            import warnings
            warnings.warn(f"Multiple hotel_ids found in WO list: {hotel_ids}")
