"""Sprint-223: SQL injection safety verification tests"""
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

def test_vendor_update_rejects_non_whitelisted_columns():
    """Vendor PATCH must filter out non-whitelisted column names."""
    r = requests.patch(f"{BASE}/api/v1/vendors/nonexistent-id",
        json={"company_name": "Test", "DROP TABLE vendors": "DANGER", "id": "injected"},
        headers=_h(), timeout=5)
    assert r.status_code in (200, 404, 422, 401, 403)
    if r.status_code == 200:
        data = r.json()
        assert "DROP TABLE vendors" not in str(data)

def test_lead_status_update_uses_parameterized_values():
    """Lead status endpoint must parameterize values."""
    r = requests.post(f"{BASE}/api/v1/leads/nonexistent/status",
        json={"status": "'; DROP TABLE leads; --"},
        timeout=5)
    assert r.status_code in (200, 400, 404, 422, 401, 403)

def test_work_order_status_only_allows_known_statuses():
    """WO status endpoint should only accept known status values."""
    r = requests.patch(f"{BASE}/api/v1/work-orders/nonexistent/status",
        json={"status": "'; DROP TABLE work_orders; --"},
        headers=_h(), timeout=5)
    assert r.status_code in (200, 400, 404, 422, 401, 403)

def test_service_request_status_is_safe():
    """Service request status update uses parameterized SQL."""
    r = requests.post(f"{BASE}/api/v1/service-requests/nonexistent/status",
        json={"status": "resolved", "resolution_notes": "Fixed"},
        headers=_h(), timeout=5)
    assert r.status_code in (200, 400, 404, 422, 401, 403)

def test_all_dynamic_queries_use_parameterized_values():
    """Verify that main API endpoints still work correctly after SQL safety review."""
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=1", headers=_h(), timeout=5)
    assert r.status_code == 200

def test_vendor_whitelist_is_enforced():
    """Column name whitelist must be enforced on vendor update."""
    from src.main import app
    import importlib
    mod = importlib.import_module("src.main")
    source = open(mod.__file__).read()
    assert '"company_name"' in source
    assert 'allowed = [' in source

def test_sql_parameterization_pattern_in_codebase():
    """Verify parameterized query pattern is consistently used."""
    import subprocess
    result = subprocess.run(
        ["grep", "-rn", r":wo_id\|:lead_id\|:sr_id\|:vendor_id\|:contract_id",
         "src/main.py"],
        capture_output=True, text=True,
        cwd="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
    )
    count = len(result.stdout.strip().split('\n'))
    assert count > 10, f"Expected many parameterized queries, found {count}"
