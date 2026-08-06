"""Sprint-052: Notifications + KG Tests"""
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


def test_notifications_list():
    r = _req.get(f"{BASE}/api/v1/notifications/?limit=10", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_notifications_is_list_or_dict():
    r = _req.get(f"{BASE}/api/v1/notifications/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), (list, dict))

def test_knowledge_graph_summary():
    r = _req.get(f"{BASE}/api/v1/knowledge-graph/", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "total_entities" in d
    assert d["total_entities"] > 0

def test_knowledge_graph_search_hvac():
    r = _req.get(f"{BASE}/api/v1/knowledge-graph/search?q=HVAC", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["total"] >= 0

def test_knowledge_graph_search_assets():
    r = _req.get(f"{BASE}/api/v1/knowledge-graph/search?q=Chiller", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_suppliers_get_fixed():
    r = _req.get(f"{BASE}/api/v1/suppliers/?limit=3", headers=_h(), timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
