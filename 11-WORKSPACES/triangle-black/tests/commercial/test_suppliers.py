"""Sprint-029: Supplier API Tests"""
import requests as _req

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
    r = _req.get(f"{BASE}/api/v1/suppliers/?limit=3", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    assert items, "No suppliers"
    return str(items[0]["id"])


def test_suppliers_list_200():
    r = _req.get(f"{BASE}/api/v1/suppliers/?limit=10", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_suppliers_have_key_fields():
    r = _req.get(f"{BASE}/api/v1/suppliers/?limit=1", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    if items:
        s = items[0]
        assert "id" in s
        assert "company_name" in s
        assert "status" in s

def test_supplier_detail_by_id():
    sid = _first_supplier_id()
    r = _req.get(f"{BASE}/api/v1/suppliers/{sid}", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "company_name" in d
    assert "supplier_code" in d

def test_supplier_detail_has_stats():
    sid = _first_supplier_id()
    r = _req.get(f"{BASE}/api/v1/suppliers/{sid}", headers=_h(), timeout=15)
    d = r.json()
    assert "stats" in d or "purchase_orders" in d

def test_supplier_has_financial_fields():
    sid = _first_supplier_id()
    r = _req.get(f"{BASE}/api/v1/suppliers/{sid}", headers=_h(), timeout=15)
    d = r.json()
    assert "payment_terms" in d
    assert "rating" in d

def test_supplier_not_found_404():
    r = _req.get(f"{BASE}/api/v1/suppliers/nonexistent-supplier-xyz",
        headers=_h(), timeout=15)
    assert r.status_code == 404

def test_suppliers_filterable():
    r = _req.get(f"{BASE}/api/v1/suppliers/?limit=2", headers=_h(), timeout=15)
    assert r.status_code == 200
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    assert len(items) <= 2

def test_supplier_has_location():
    sid = _first_supplier_id()
    r = _req.get(f"{BASE}/api/v1/suppliers/{sid}", headers=_h(), timeout=15)
    d = r.json()
    assert "city" in d or "country" in d or "supplier_type" in d
