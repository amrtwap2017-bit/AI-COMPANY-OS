"""Sprint-051: Suppliers Fix + Knowledge Graph Tests"""
import requests as _req, uuid

BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = _req.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]


def test_suppliers_get_200():
    r = _req.get(f"{BASE}/api/v1/suppliers/?limit=3", headers=_h(), timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_suppliers_post_200():
    r = _req.post(f"{BASE}/api/v1/suppliers/",
        json={"company_name": f"S051-{uuid.uuid4().hex[:6]}"},
        headers=_h(), timeout=15)
    assert r.status_code in (200, 201)
    assert r.json().get("id") or r.json().get("ok")

def test_knowledge_graph_summary():
    r = _req.get(f"{BASE}/api/v1/knowledge-graph/", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "assets" in d
    assert "total_entities" in d

def test_knowledge_graph_search_empty():
    r = _req.get(f"{BASE}/api/v1/knowledge-graph/search?q=", headers=_h(), timeout=15)
    assert r.status_code == 200
    assert r.json()["total"] == 0

def test_knowledge_graph_search_hvac():
    r = _req.get(f"{BASE}/api/v1/knowledge-graph/search?q=HVAC", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "results" in d
    assert isinstance(d["results"], list)

def test_knowledge_graph_search_returns_types():
    r = _req.get(f"{BASE}/api/v1/knowledge-graph/search?q=a", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    if d["results"]:
        assert "type" in d["results"][0]
        assert "label" in d["results"][0]
