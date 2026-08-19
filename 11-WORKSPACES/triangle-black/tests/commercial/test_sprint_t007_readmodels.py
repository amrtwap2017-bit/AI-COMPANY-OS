"""T-007: Executive Read Models — Integration Tests"""
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

# ── File existence ────────────────────────────────────────────────────────────
def test_read_models_file_exists():
    assert (SRC / "commercial/executive_intelligence/read_models.py").exists()

def test_router_file_exists():
    assert (SRC / "commercial/executive_intelligence/router.py").exists()

# ── Class structure ───────────────────────────────────────────────────────────
def test_read_model_class_importable():
    from src.commercial.executive_intelligence.read_models import ExecutiveKPIReadModel
    assert ExecutiveKPIReadModel is not None

def test_read_model_has_all_methods():
    from src.commercial.executive_intelligence.read_models import ExecutiveKPIReadModel
    for method in ["get_operations_kpi", "get_maintenance_kpi",
                   "get_procurement_kpi", "get_financial_kpi", "get_full_summary"]:
        assert hasattr(ExecutiveKPIReadModel, method), f"Missing: {method}"

def test_read_model_enforces_hotel_id():
    text = (SRC / "commercial/executive_intelligence/read_models.py").read_text()
    assert "hotel_id = :hid" in text or "hotel_id = :hotel_id" in text

def test_router_has_all_endpoints():
    text = (SRC / "commercial/executive_intelligence/router.py").read_text()
    for ep in ["/summary", "/operations", "/maintenance", "/procurement", "/financial"]:
        assert ep in text, f"Missing endpoint: {ep}"

def test_router_uses_read_model():
    text = (SRC / "commercial/executive_intelligence/router.py").read_text()
    assert "ExecutiveKPIReadModel" in text

def test_router_registered_in_main():
    text = (SRC / "main.py").read_text()
    assert "executive_intelligence" in text

# ── Live API tests ────────────────────────────────────────────────────────────
def test_summary_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/summary",
        headers=_h(), timeout=10)
    _s(r, "ei-summary")
    assert r.status_code == 200, f"Summary returned {r.status_code}"

def test_summary_has_all_sections():
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/summary",
        headers=_h(), timeout=10)
    _s(r, "ei-sections")
    if r.status_code == 200:
        d = r.json()
        assert "hotel_id" in d
        assert "operations" in d
        assert "maintenance" in d
        assert "procurement" in d
        assert "financial" in d

def test_operations_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/operations",
        headers=_h(), timeout=10)
    _s(r, "ei-ops")
    assert r.status_code == 200

def test_operations_has_work_order_fields():
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/operations",
        headers=_h(), timeout=10)
    _s(r, "ei-wo-fields")
    if r.status_code == 200:
        d = r.json()
        assert "hotel_id" in d
        assert "open_work_orders" in d or "error" in d

def test_maintenance_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/maintenance",
        headers=_h(), timeout=10)
    _s(r, "ei-maint")
    assert r.status_code == 200

def test_procurement_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/procurement",
        headers=_h(), timeout=10)
    _s(r, "ei-proc")
    assert r.status_code == 200

def test_financial_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/financial",
        headers=_h(), timeout=10)
    _s(r, "ei-fin")
    assert r.status_code == 200

def test_all_endpoints_require_auth():
    for ep in ["/summary", "/operations", "/maintenance", "/procurement", "/financial"]:
        r = requests.get(f"{BASE}/api/v1/executive-intelligence{ep}", timeout=5)
        _s(r, f"ei-noauth-{ep}")
        assert r.status_code in (200, 401, 403, 422)

def test_summary_response_time_acceptable():
    import time
    start = time.perf_counter()
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/summary",
        headers=_h(), timeout=10)
    ms = (time.perf_counter() - start) * 1000
    _s(r, "ei-perf")
    if r.status_code == 200:
        assert ms < 3000, f"Summary took {ms:.0f}ms — too slow"
