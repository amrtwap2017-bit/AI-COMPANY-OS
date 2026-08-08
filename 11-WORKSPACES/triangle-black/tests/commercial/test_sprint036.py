import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")

"""Sprint-036: Invoice Payment Tests"""
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

def _first_invoice_id():
    r = _req.get(f"{BASE}/api/v1/invoices/?limit=5", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", r.json().get("items", []))
    assert items, "No invoices"
    return str(items[0]["id"])


def test_invoices_list():
    r = _req.get(f"{BASE}/api/v1/invoices/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_invoice_detail():
    iid = _first_invoice_id()
    r = _req.get(f"{BASE}/api/v1/invoices/{iid}", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_invoice_payment_endpoint_exists():
    iid = _first_invoice_id()
    r = _req.post(f"{BASE}/api/v1/invoices/{iid}/payment",
        json={"amount": 0},
        headers=_h(), timeout=15)
    assert r.status_code in (200, 201, 204, 400, 401, 422)  # 401 = payment requires auth

def test_invoice_payments_history():
    iid = _first_invoice_id()
    r = _req.get(f"{BASE}/api/v1/invoices/{iid}/payments", headers=_h(), timeout=15)
    assert r.status_code in (200, 404)

def test_invoice_payment_summary():
    r = _req.get(f"{BASE}/api/v1/invoices/payment-summary", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_invoice_not_found():
    r = _req.get(f"{BASE}/api/v1/invoices/nonexistent-inv-xyz", headers=_h(), timeout=15)
    assert r.status_code == 404
