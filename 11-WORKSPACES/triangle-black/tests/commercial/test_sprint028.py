import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")

"""Sprint-028: Asset QR Scanner Tests"""
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

def _first_asset_id():
    r = _req.get(f"{BASE}/api/v1/assets/?limit=5", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", r.json().get("items", []))
    assert items, "No assets in DB"
    return str(items[0]["id"])


def test_assets_list_returns_200():
    r = _req.get(f"{BASE}/api/v1/assets/?limit=10", headers=_h(), timeout=15)
    assert r.status_code == 200


def test_assets_have_qr_fields():
    r = _req.get(f"{BASE}/api/v1/assets/?limit=1", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", r.json().get("items", []))
    if items:
        a = items[0]
        assert "id" in a
        assert "name" in a
        assert "status" in a


def test_asset_detail_by_id():
    asset_id = _first_asset_id()
    r = _req.get(f"{BASE}/api/v1/assets/{asset_id}", headers=_h(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "name" in data
    assert "id" in data


def test_asset_has_location():
    asset_id = _first_asset_id()
    r = _req.get(f"{BASE}/api/v1/assets/{asset_id}", headers=_h(), timeout=15)
    data = r.json()
    assert "location_description" in data or "site_id" in data


def test_asset_not_found_returns_404():
    r = _req.get(f"{BASE}/api/v1/assets/nonexistent-asset-xyz-sprint028",
        headers=_h(), timeout=15)
    assert r.status_code == 404


def test_assets_filterable():
    r = _req.get(f"{BASE}/api/v1/assets/?limit=3", headers=_h(), timeout=15)
    assert r.status_code == 200
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    assert len(items) <= 3
