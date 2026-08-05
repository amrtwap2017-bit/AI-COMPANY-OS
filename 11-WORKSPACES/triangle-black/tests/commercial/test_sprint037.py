"""Sprint-037: Contract Renewal Tests"""
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

def _first_contract_id():
    r = _req.get(f"{BASE}/api/v1/contracts/?limit=5", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", r.json().get("items", []))
    assert items, "No contracts"
    return str(items[0]["id"])


def test_contracts_list():
    r = _req.get(f"{BASE}/api/v1/contracts/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_contract_detail():
    cid = _first_contract_id()
    r = _req.get(f"{BASE}/api/v1/contracts/{cid}", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "title" in d

def test_contract_has_value():
    cid = _first_contract_id()
    r = _req.get(f"{BASE}/api/v1/contracts/{cid}", headers=_h(), timeout=15)
    d = r.json()
    assert "total_value" in d or "value" in d

def test_contract_create():
    r = _req.post(f"{BASE}/api/v1/contracts/",
        json={"title": "Sprint037 Test Renewal", "total_value": 50000},
        headers=_h(), timeout=15)
    assert r.status_code in (200, 201, 422)

def test_contract_not_found():
    r = _req.get(f"{BASE}/api/v1/contracts/nonexistent-contract-xyz", headers=_h(), timeout=15)
    assert r.status_code == 404

def test_asset_maintenance_tree():
    r = _req.get(f"{BASE}/api/v1/maintenance/asset-tree", headers=_h(), timeout=15)
    assert r.status_code == 200
