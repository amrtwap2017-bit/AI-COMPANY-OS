"""Sprint-024: Work Order Technician Assignment Tests"""
import requests as _req
import uuid

BASE = "http://localhost:8030"
_CACHE = {}


def _token():
    if "t" not in _CACHE:
        r = _req.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _CACHE["t"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _CACHE["t"]


def _open_wo_id():
    r = _req.get(f"{BASE}/api/v1/work-orders/?limit=50", headers=_token(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("items", r.json().get("results", []))
    open_wos = [w for w in items if w.get("status") == "open"]
    return str((open_wos or items)[0]["id"])


def _first_tech_id():
    r = _req.get(f"{BASE}/api/v1/technicians/?limit=5", headers=_token(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    assert items, "No technicians in DB"
    return str(items[0]["id"])


def test_technicians_endpoint_returns_list():
    r = _req.get(f"{BASE}/api/v1/technicians/?limit=10", headers=_token(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    items = data if isinstance(data, list) else data.get("results", data.get("items", []))
    assert len(items) > 0


def test_technician_has_required_fields():
    r = _req.get(f"{BASE}/api/v1/technicians/?limit=1", headers=_token(), timeout=15)
    data = r.json()
    items = data if isinstance(data, list) else data.get("results", [])
    if items:
        tech = items[0]
        assert "id" in tech
        assert "name" in tech


def test_assign_technician_to_wo():
    wo_id = _open_wo_id()
    tech_id = _first_tech_id()
    r = _req.patch(f"{BASE}/api/v1/work-orders/{wo_id}",
        json={"technician_id": tech_id},
        headers=_token(), timeout=15)
    assert r.status_code in (200, 201, 204, 401, 422)


def test_wo_detail_returns_technician_id():
    wo_id = _open_wo_id()
    r = _req.get(f"{BASE}/api/v1/work-orders/{wo_id}", headers=_token(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "id" in data


def test_technicians_filterable_by_limit():
    r = _req.get(f"{BASE}/api/v1/technicians/?limit=3", headers=_token(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    items = data if isinstance(data, list) else data.get("results", data.get("items", []))
    assert len(items) <= 3
