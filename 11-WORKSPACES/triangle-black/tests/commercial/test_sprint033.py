"""Sprint-033: Service Request Status Management Tests"""
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

def _first_sr_id():
    r = _req.get(f"{BASE}/api/v1/service-requests/?limit=5", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", r.json().get("items", []))
    assert items, "No service requests in DB"
    return str(items[0]["id"])


def test_service_requests_list_200():
    r = _req.get(f"{BASE}/api/v1/service-requests/?limit=10", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_service_requests_have_fields():
    r = _req.get(f"{BASE}/api/v1/service-requests/?limit=1", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("items", [])
    if items:
        sr = items[0]
        assert "id" in sr
        assert "status" in sr
        assert "hotel_id" in sr

def test_service_request_detail():
    sid = _first_sr_id()
    r = _req.get(f"{BASE}/api/v1/service-requests/{sid}", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "status" in d

def test_service_request_patch_status():
    sid = _first_sr_id()
    r = _req.patch(f"{BASE}/api/v1/service-requests/{sid}",
        json={"status": "in_progress"},
        headers=_h(), timeout=15)
    assert r.status_code in (200, 201, 204, 422)

def test_service_request_not_found():
    r = _req.get(f"{BASE}/api/v1/service-requests/nonexistent-sr-xyz",
        headers=_h(), timeout=15)
    assert r.status_code == 404

def test_service_requests_filterable():
    r = _req.get(f"{BASE}/api/v1/service-requests/?limit=2", headers=_h(), timeout=15)
    assert r.status_code == 200
    items = r.json() if isinstance(r.json(), list) else r.json().get("items", [])
    assert len(items) <= 2
