"""Sprint-022: Work Order Complete + Auto-Invoice Tests
Self-contained: fetches fresh token per test session to avoid stale JWT.
"""
import pytest
import requests as _req

pytestmark = pytest.mark.live_http

BASE = "http://localhost:8030"
_TOKEN_CACHE = {}


def _fresh_token():
    """Get a fresh JWT token — bypasses stale session-scoped fixture."""
    if "token" not in _TOKEN_CACHE:
        r = _req.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10,
        )
        assert r.status_code == 200, f"Login failed: {r.text}"
        _TOKEN_CACHE["token"] = r.json()["access_token"]
    return {"Authorization": f"Bearer {_TOKEN_CACHE['token']}"}


def _get_open_wo_id():
    """Get first open work order ID from the API."""
    h = _fresh_token()
    r = _req.get(f"{BASE}/api/v1/work-orders/?limit=50", headers=h, timeout=15)
    assert r.status_code == 200, f"WO list failed: {r.status_code} {r.text[:100]}"
    data = r.json()
    items = data if isinstance(data, list) else data.get("results", data.get("items", []))
    open_wos = [w for w in items if w.get("status") == "open"]
    wos = open_wos or items
    assert wos, "No work orders in DB"
    return str(wos[0]["id"])


def test_complete_endpoint_exists():
    """Route is registered — returns 404 for nonexistent WO (not 405/422)."""
    r = _req.post(
        f"{BASE}/api/v1/work-orders/nonexistent-wo-xyz-sprint022/complete",
        headers=_fresh_token(), timeout=15
    )
    assert r.status_code == 404, f"Expected 404, got {r.status_code}: {r.text}"


def test_complete_work_order():
    """Complete an existing WO — returns ok=True + invoice_id."""
    wo_id = _get_open_wo_id()
    r = _req.post(f"{BASE}/api/v1/work-orders/{wo_id}/complete",
        headers=_fresh_token(), timeout=15)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    data = r.json()
    assert data.get("ok") is True
    assert data.get("status") == "completed"
    assert data.get("invoice_id") is not None


def test_complete_creates_auto_invoice():
    """Invoice number must be AUTO-{wo_id[:8]}."""
    wo_id = _get_open_wo_id()
    r = _req.post(f"{BASE}/api/v1/work-orders/{wo_id}/complete",
        headers=_fresh_token(), timeout=15)
    assert r.status_code == 200
    assert r.json().get("invoice_number") == f"AUTO-{wo_id[:8]}"


def test_complete_is_idempotent():
    """Two calls return same invoice_id — no duplicates."""
    wo_id = _get_open_wo_id()
    h = _fresh_token()
    r1 = _req.post(f"{BASE}/api/v1/work-orders/{wo_id}/complete", headers=h, timeout=15)
    r2 = _req.post(f"{BASE}/api/v1/work-orders/{wo_id}/complete", headers=h, timeout=15)
    assert r1.status_code == 200
    assert r2.status_code == 200
    assert r1.json().get("invoice_id") == r2.json().get("invoice_id")


def test_complete_response_structure():
    """Response has all required fields."""
    wo_id = _get_open_wo_id()
    r = _req.post(f"{BASE}/api/v1/work-orders/{wo_id}/complete",
        headers=_fresh_token(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    for field in ["ok", "work_order_id", "status", "invoice_id", "invoice_number"]:
        assert field in data, f"Missing field: {field}"
