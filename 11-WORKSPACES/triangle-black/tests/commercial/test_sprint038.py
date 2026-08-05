"""Sprint-038: Asset Maintenance History Tests"""
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
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    assert items, "No assets"
    return str(items[0]["id"])


def test_assets_list():
    r = _req.get(f"{BASE}/api/v1/assets/?limit=10", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_asset_detail():
    aid = _first_asset_id()
    r = _req.get(f"{BASE}/api/v1/assets/{aid}", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "name" in d

def test_asset_has_maintenance_fields():
    aid = _first_asset_id()
    r = _req.get(f"{BASE}/api/v1/assets/{aid}", headers=_h(), timeout=15)
    d = r.json()
    assert "criticality" in d or "status" in d

def test_maintenance_pm_plans_list():
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_maintenance_asset_tree():
    r = _req.get(f"{BASE}/api/v1/maintenance/asset-tree", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_asset_not_found():
    r = _req.get(f"{BASE}/api/v1/assets/nonexistent-asset-sprint038", headers=_h(), timeout=15)
    assert r.status_code == 404
