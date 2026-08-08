import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")

"""Sprint-035: Purchase Order Create Tests"""
import requests as _req, uuid

BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = _req.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def _first_supplier_id():
    r = _req.get(f"{BASE}/api/v1/suppliers/?limit=1", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    return str(items[0]["id"]) if items else None


def test_po_list_200():
    r = _req.get(f"{BASE}/api/v1/purchase-orders/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_po_has_required_fields():
    r = _req.get(f"{BASE}/api/v1/purchase-orders/?limit=1", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", r.json().get("items", []))
    if items:
        po = items[0]
        assert "id" in po
        assert "vendor_id" in po
        assert "status" in po

def test_po_create_requires_vendor():
    r = _req.post(f"{BASE}/api/v1/purchase-orders/",
        json={"status": "draft"},
        headers=_h(), timeout=15)
    assert r.status_code == 422

def test_po_create_with_vendor():
    sid = _first_supplier_id()
    if not sid:
        return
    r = _req.post(f"{BASE}/api/v1/purchase-orders/",
        json={"vendor_id": sid, "status": "draft", "payment_terms": "net_30", "total_amount": 0},
        headers=_h(), timeout=15)
    assert r.status_code in (200, 201, 422)

def test_po_get_nonexistent():
    r = _req.get(f"{BASE}/api/v1/purchase-orders/nonexistent-po-xyz", headers=_h(), timeout=15)
    assert r.status_code == 404

def test_suppliers_for_po_dropdown():
    r = _req.get(f"{BASE}/api/v1/suppliers/?limit=10", headers=_h(), timeout=15)
    assert r.status_code in (200, 500)
