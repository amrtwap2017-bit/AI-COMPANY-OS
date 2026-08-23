"""
Sprint D-003: Digital Twin 2.0 Semantic Graph & Failure Simulation Verification Test
"""
import pytest
import requests

BASE = "http://localhost:8030"

_C = {}
def _auth():
    if "h" not in _C:
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_semantic_graph_traversal_api():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/twin/semantic-graph/traverse/asset/ast-chiller-01", headers=h, timeout=10)
    assert r.status_code == 200, f"Traversal failed: {r.text}"
    data = r.json()

    assert "nodes" in data
    assert "edges" in data
    assert data["total_nodes"] >= 3
    assert data["total_edges"] >= 2

    # Check for downstream relationships
    rel_types = [e["relationship"] for e in data["edges"]]
    assert any("MAINTAINED_BY" in rel or "COOLS_AND_SERVES" in rel for rel in rel_types)

def test_failure_blast_radius_simulation_api():
    h = _auth()
    payload = {"asset_id": "ast-chiller-01"}
    r = requests.post(f"{BASE}/api/v1/twin/semantic-graph/simulate-failure", json=payload, headers=h, timeout=10)
    assert r.status_code == 200, f"Simulation failed: {r.text}"
    data = r.json()

    assert data["simulation_status"] == "COMPLETED"
    assert "blast_radius" in data
    blast = data["blast_radius"]
    assert blast["affected_zones_count"] >= 1
    assert blast["estimated_unplanned_cost_usd"] > 1000.0
    assert len(blast["required_parts"]) >= 1
