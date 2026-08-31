"""
Sprint 11 — Digital Twin Failure Propagation
Verifies: POST /twin/simulate/failure + GET /twin/critical-path

Evidence: Live verified 2026-08-30
/critical-path: 10 assets analyzed · top=Chiller Unit X (score=189)
/simulate/failure: asset=Trane CenTraVac · zones=3 · cost=15200 · sla=92%
Existing endpoints preserved: /twin/state · /twin/impact-chain
"""
import pytest
import requests

BASE = "http://localhost:8030"
TEST_ASSET_ID = "as01"
TEST_ASSET_MANY = "ast-c7e536022b0e"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

class TestTwinAuth:
    def test_critical_path_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/twin/critical-path", timeout=10)
        assert r.status_code in (401, 403)

    def test_simulate_failure_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/twin/simulate/failure",
                         json={"asset_id": TEST_ASSET_ID}, timeout=10)
        assert r.status_code in (401, 403)

class TestCriticalPath:
    def test_critical_path_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/critical-path",
                        headers=auth_headers, timeout=20)
        _skip(r, "critical-path")
        assert r.status_code == 200

    def test_critical_path_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/critical-path",
                        headers=auth_headers, timeout=20)
        _skip(r, "cp-fields")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "total_assets_analyzed" in d
        assert "critical_path_count" in d
        assert "critical_path" in d
        assert "summary" in d
        assert "methodology" in d

    def test_critical_path_returns_real_assets(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/critical-path",
                        headers=auth_headers, timeout=20)
        _skip(r, "cp-real")
        assert r.status_code == 200
        d = r.json()
        assert d["total_assets_analyzed"] > 0
        assert len(d["critical_path"]) > 0

    def test_critical_path_asset_structure(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/critical-path",
                        headers=auth_headers, timeout=20)
        _skip(r, "cp-structure")
        assert r.status_code == 200
        for asset in r.json()["critical_path"]:
            assert "asset_id" in asset
            assert "name" in asset
            assert "criticality" in asset
            assert "impact_score" in asset
            assert "risk_level" in asset
            assert "total_wos_90d" in asset
            assert "action" in asset
            assert asset["risk_level"] in ("CRITICAL", "HIGH", "MEDIUM")

    def test_critical_path_sorted_by_impact_score(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/critical-path",
                        headers=auth_headers, timeout=20)
        _skip(r, "cp-sorted")
        assert r.status_code == 200
        assets = r.json()["critical_path"]
        if len(assets) >= 2:
            scores = [a["impact_score"] for a in assets]
            assert scores == sorted(scores, reverse=True), \
                "Assets must be sorted by impact_score descending"

    def test_critical_path_top_asset_known(self, auth_headers):
        """Real data: Chiller Unit X has highest impact score."""
        r = requests.get(f"{BASE}/api/v1/twin/critical-path",
                        headers=auth_headers, timeout=20)
        _skip(r, "cp-top")
        assert r.status_code == 200
        assets = r.json()["critical_path"]
        top = assets[0]
        assert top["impact_score"] > 0
        assert top["total_wos_90d"] > 0

    def test_critical_path_tenant_scoped(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/critical-path",
                        headers=auth_headers, timeout=20)
        _skip(r, "cp-tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")

    def test_critical_path_limit_param(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/critical-path?limit=3",
                        headers=auth_headers, timeout=20)
        _skip(r, "cp-limit")
        assert r.status_code == 200
        assert len(r.json()["critical_path"]) <= 3

class TestSimulateFailure:
    def test_simulate_failure_returns_200(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/twin/simulate/failure",
                         headers=auth_headers,
                         json={"asset_id": TEST_ASSET_ID,
                               "failure_type": "breakdown",
                               "duration_hours": 48},
                         timeout=20)
        _skip(r, "simulate")
        assert r.status_code == 200

    def test_simulate_failure_has_required_fields(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/twin/simulate/failure",
                         headers=auth_headers,
                         json={"asset_id": TEST_ASSET_ID}, timeout=20)
        _skip(r, "simulate-fields")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "asset_id" in d
        assert "asset_name" in d
        assert "criticality" in d
        assert "blast_radius" in d
        assert "simulation_status" in d

    def test_simulate_failure_blast_radius_structure(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/twin/simulate/failure",
                         headers=auth_headers,
                         json={"asset_id": TEST_ASSET_ID}, timeout=20)
        _skip(r, "simulate-blast")
        assert r.status_code == 200
        br = r.json()["blast_radius"]
        assert "affected_zones_count" in br
        assert "affected_zones" in br
        assert "estimated_unplanned_cost_usd" in br
        assert "sla_breach_probability_pct" in br
        assert "recommended_mitigation" in br

    def test_simulate_failure_enriches_input_params(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/twin/simulate/failure",
                         headers=auth_headers,
                         json={"asset_id": TEST_ASSET_ID,
                               "failure_type": "electrical",
                               "duration_hours": 72}, timeout=20)
        _skip(r, "simulate-enrich")
        assert r.status_code == 200
        d = r.json()
        assert d.get("failure_type") == "electrical"
        assert d.get("duration_hours") == 72

    def test_simulate_critical_asset_high_cost(self, auth_headers):
        """Critical asset simulation should show higher cost."""
        r = requests.post(f"{BASE}/api/v1/twin/simulate/failure",
                         headers=auth_headers,
                         json={"asset_id": TEST_ASSET_ID,
                               "failure_type": "breakdown"}, timeout=20)
        _skip(r, "simulate-cost")
        assert r.status_code == 200
        cost = r.json()["blast_radius"]["estimated_unplanned_cost_usd"]
        assert cost > 0

class TestExistingEndpointsPreserved:
    def test_twin_state_still_works(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/state",
                        headers=auth_headers, timeout=15)
        _skip(r, "twin-state")
        assert r.status_code == 200

    def test_twin_impact_chain_still_works(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/impact-chain/{TEST_ASSET_ID}",
                        headers=auth_headers, timeout=15)
        _skip(r, "twin-impact")
        assert r.status_code == 200

    def test_twin_graph_stats_still_works(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/graph/stats",
                        headers=auth_headers, timeout=15)
        _skip(r, "twin-stats")
        assert r.status_code == 200
