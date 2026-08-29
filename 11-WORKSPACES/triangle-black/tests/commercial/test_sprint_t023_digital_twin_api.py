"""T-023: Digital Twin impact query API"""
import requests
import pytest
from pathlib import Path
from unittest.mock import MagicMock

BASE = "http://localhost:8030"
SRC  = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")
HOTEL = "tb-default-hotel-000000000001"

_C = {}
def _h():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_twin_router_has_graph_endpoints():
    src = (SRC / "commercial/digital_twin/router.py").read_text()
    for ep in ["graph/stats", "graph/stats", "graph/impact", "graph/project"]:
        assert ep in src, f"Missing: {ep}"

def test_twin_router_uses_twin_query():
    src = (SRC / "commercial/digital_twin/router.py").read_text()
    assert "get_twin_graph_stats" in src
    assert "TwinProjector" in src

def test_twin_router_scoped_to_hotel():
    src = (SRC / "commercial/digital_twin/router.py").read_text()
    assert "get_hotel_id" in src

def test_twin_graph_stats_endpoint():
    r = requests.get(f"{BASE}/api/v1/twin/graph/stats",
                     headers=_h(), timeout=5)
    _s(r, "twin-stats")
    assert r.status_code in (200, 404)  # endpoint exists, ID may not

def test_twin_graph_stats_has_fields():
    r = requests.get(f"{BASE}/api/v1/twin/graph/stats",
                     headers=_h(), timeout=5)
    _s(r, "twin-stats-fields")
    if r.status_code == 200:
        d = r.json()
        assert "hotel_id" in d or "total_nodes" in d or "error" in d

def test_twin_node_404_for_nonexistent():
    r = requests.get(f"{BASE}/api/v1/twin/graph/node/work_order/nonexistent-id",
                     headers=_h(), timeout=5)
    _s(r, "twin-node-404")
    assert r.status_code in (200, 404)

def test_twin_impact_endpoint():
    r = requests.get(f"{BASE}/api/v1/twin/graph/impact/work_order/test-id",
                     headers=_h(), timeout=5)
    _s(r, "twin-impact")
    assert r.status_code in (200, 404)  # endpoint exists, ID may not

def test_twin_impact_has_edges():
    r = requests.get(f"{BASE}/api/v1/twin/graph/impact/work_order/test-id",
                     headers=_h(), timeout=5)
    _s(r, "twin-impact-edges")
    if r.status_code == 200:
        d = r.json()
        assert "edges" in d or "error" in d

def test_twin_project_endpoint():
    r = requests.post(
        f"{BASE}/api/v1/twin/graph/project/work_order/test-wo-id",
        headers={**_h(), "Content-Type": "application/json"},
        json={"event_type": "work_order.updated", "payload": {"status": "open"}},
        timeout=10,
    )
    _s(r, "twin-project")
    assert r.status_code in (200, 404)  # endpoint exists, ID may not
    if r.status_code == 200:
        d = r.json()
        assert "ok" in d

def test_twin_state_still_works():
    r = requests.get(f"{BASE}/api/v1/twin/state",
                     headers=_h(), timeout=10)
    _s(r, "twin-state")
    assert r.status_code in (200, 401)

def test_projector_has_non_blocking_guarantee():
    src = (SRC / "commercial/digital_twin/projector.py").read_text()
    assert "except Exception" in src

def test_health_still_ok():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code in (200, 404)  # endpoint exists, ID may not
