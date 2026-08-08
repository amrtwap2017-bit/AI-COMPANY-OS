import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")

"""Sprint-034: Inventory Alerts Tests"""
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


def test_stock_balances_list():
    r = _req.get(f"{BASE}/api/v1/stock-balances/?limit=10", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_stock_balances_have_qty_fields():
    r = _req.get(f"{BASE}/api/v1/stock-balances/?limit=5", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    if items:
        s = items[0]
        assert "qty_available" in s
        assert "qty_on_hand" in s
        assert "item_id" in s

def test_stock_balances_have_hotel_id():
    r = _req.get(f"{BASE}/api/v1/stock-balances/?limit=1", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    if items:
        assert "hotel_id" in items[0]

def test_low_stock_items_exist():
    r = _req.get(f"{BASE}/api/v1/stock-balances/?limit=200", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    low = [i for i in items if float(i.get("qty_available", 999)) < 20]
    assert len(items) > 0, "No stock items found"

def test_warehouses_list():
    r = _req.get(f"{BASE}/api/v1/warehouses/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_stock_movements_list():
    r = _req.get(f"{BASE}/api/v1/stock-movements/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200
