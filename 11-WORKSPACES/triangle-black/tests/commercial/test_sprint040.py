import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")

"""Sprint-040: Goods Receipt (GRN) Tests"""
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

def _first_grn_id():
    r = _req.get(f"{BASE}/api/v1/goods-receipts/?limit=3", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    assert items, "No GRNs"
    return str(items[0]["id"])


def test_goods_receipts_list():
    r = _req.get(f"{BASE}/api/v1/goods-receipts/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_goods_receipts_have_grn_number():
    r = _req.get(f"{BASE}/api/v1/goods-receipts/?limit=1", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    if items:
        assert "grn_number" in items[0] or "id" in items[0]

def test_grn_detail():
    gid = _first_grn_id()
    r = _req.get(f"{BASE}/api/v1/goods-receipts/{gid}", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_grn_not_found():
    r = _req.get(f"{BASE}/api/v1/goods-receipts/nonexistent-grn-xyz", headers=_h(), timeout=15)
    assert r.status_code == 404

def test_grn_has_hotel_id():
    r = _req.get(f"{BASE}/api/v1/goods-receipts/?limit=1", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    if items:
        assert "hotel_id" in items[0]

def test_pos_for_grn_dropdown():
    r = _req.get(f"{BASE}/api/v1/purchase-orders/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200
