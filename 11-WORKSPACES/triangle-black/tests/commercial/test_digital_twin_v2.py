"""
V6-E03 — Digital Twin 2.0: Decision Infrastructure Tests
Upgrades from visualization to impact-chain analysis.

Evidence: Live verified 2026-08-29
  state:        200 — health=80, 7 domains ✅
  graph/stats:  200 — node counts from operational DB ✅
  impact-chain: 200 — risk=HIGH, 3 chain steps ✅
  asset/impact: 200 — connections from WO + PM tables ✅
  wo/impact:    200 — asset + technician connections ✅

Key fix: maintenance_plans uses asset_node_id (not asset_id)
"""
import pytest
import requests
from sqlalchemy import create_engine, text as sqlt

BASE = "http://localhost:8030"
VALID_RISK = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
DB_URL = "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"
HOTEL_ID = "tb-default-hotel-000000000001"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


def _get_test_ids():
    """Get real asset_id and wo_id from DB for tests."""
    try:
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            asset_id = conn.execute(sqlt(
                "SELECT id FROM assets WHERE hotel_id=:h LIMIT 1"
            ), {"h": HOTEL_ID}).fetchone()[0]
            wo_id = conn.execute(sqlt(
                "SELECT id FROM work_orders WHERE hotel_id=:h LIMIT 1"
            ), {"h": HOTEL_ID}).fetchone()[0]
            return asset_id, wo_id
    except Exception:
        return "ast-test", "wo-test"


class TestDigitalTwinAuth:
    def test_state_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/twin/state", timeout=10)
        assert r.status_code in (401, 403)

    def test_graph_stats_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/twin/graph/stats", timeout=10)
        assert r.status_code in (401, 403)

    def test_impact_chain_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/twin/impact-chain/any-id", timeout=10)
        assert r.status_code in (401, 403)

    def test_asset_impact_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/twin/asset/any-id/impact", timeout=10)
        assert r.status_code in (401, 403)

    def test_wo_impact_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/twin/work-order/any-id/impact", timeout=10)
        assert r.status_code in (401, 403)


class TestTwinState:
    def test_state_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/state",
                        headers=auth_headers, timeout=15)
        _skip(r, "state")
        assert r.status_code == 200

    def test_state_has_health_score(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/state",
                        headers=auth_headers, timeout=15)
        _skip(r, "state-health")
        assert r.status_code == 200
        d = r.json()
        assert "health_score" in d
        assert 0 <= d["health_score"] <= 100
        assert d["health_label"] in ("Healthy", "Warning", "Degraded", "Critical")

    def test_state_has_operational_domains(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/state",
                        headers=auth_headers, timeout=15)
        _skip(r, "state-domains")
        assert r.status_code == 200
        d = r.json()
        assert "operational_domains" in d
        assert len(d["operational_domains"]) >= 5
        domain_names = [dom["domain"] for dom in d["operational_domains"]]
        assert "Work Orders" in domain_names
        assert "Assets" in domain_names

    def test_state_is_tenant_scoped(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/state",
                        headers=auth_headers, timeout=15)
        _skip(r, "state-tenant")
        assert r.status_code == 200
        assert r.json().get("hotel_id", "").startswith("tb-")

    def test_state_has_no_error(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/state",
                        headers=auth_headers, timeout=15)
        _skip(r, "state-no-error")
        assert r.status_code == 200
        assert "error" not in r.json()


class TestGraphStats:
    def test_graph_stats_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/graph/stats",
                        headers=auth_headers, timeout=15)
        _skip(r, "graph-stats")
        assert r.status_code == 200

    def test_graph_stats_has_node_counts(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/graph/stats",
                        headers=auth_headers, timeout=15)
        _skip(r, "graph-nodes")
        assert r.status_code == 200
        d = r.json()
        assert "node_counts" in d
        assert "total_nodes" in d
        assert d["total_nodes"] >= 0
        for key in ["assets", "work_orders", "pm_plans", "suppliers"]:
            assert key in d["node_counts"]

    def test_graph_stats_no_error(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/graph/stats",
                        headers=auth_headers, timeout=15)
        _skip(r, "graph-no-error")
        assert r.status_code == 200
        assert "error" not in r.json()

    def test_graph_stats_tenant_scoped(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/graph/stats",
                        headers=auth_headers, timeout=15)
        _skip(r, "graph-tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")


class TestImpactChain:
    def test_impact_chain_returns_200(self, auth_headers):
        asset_id, _ = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/impact-chain/{asset_id}",
                        headers=auth_headers, timeout=15)
        _skip(r, "impact-chain")
        assert r.status_code == 200

    def test_impact_chain_has_risk_level(self, auth_headers):
        asset_id, _ = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/impact-chain/{asset_id}",
                        headers=auth_headers, timeout=15)
        _skip(r, "impact-risk")
        assert r.status_code == 200
        d = r.json()
        assert d.get("risk_level") in VALID_RISK
        assert 0 <= d.get("risk_score", 0) <= 100

    def test_impact_chain_has_asset_info(self, auth_headers):
        asset_id, _ = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/impact-chain/{asset_id}",
                        headers=auth_headers, timeout=15)
        _skip(r, "impact-asset")
        assert r.status_code == 200
        d = r.json()
        assert "asset" in d
        assert d["asset"]["name"]

    def test_impact_chain_has_summary(self, auth_headers):
        asset_id, _ = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/impact-chain/{asset_id}",
                        headers=auth_headers, timeout=15)
        _skip(r, "impact-summary")
        assert r.status_code == 200
        d = r.json()
        assert "summary" in d
        s = d["summary"]
        assert "total_work_orders" in s
        assert "open_work_orders" in s
        assert "pm_plans" in s

    def test_impact_chain_has_recommendation(self, auth_headers):
        asset_id, _ = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/impact-chain/{asset_id}",
                        headers=auth_headers, timeout=15)
        _skip(r, "impact-rec")
        assert r.status_code == 200
        d = r.json()
        assert "recommendation" in d
        assert len(d["recommendation"]) > 10

    def test_impact_chain_unknown_asset_404(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/impact-chain/nonexistent-asset-id",
                        headers=auth_headers, timeout=10)
        _skip(r, "impact-404")
        assert r.status_code == 404

    def test_impact_chain_tenant_scoped(self, auth_headers):
        asset_id, _ = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/impact-chain/{asset_id}",
                        headers=auth_headers, timeout=15)
        _skip(r, "impact-tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")


class TestAssetImpact:
    def test_asset_impact_returns_200(self, auth_headers):
        asset_id, _ = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/asset/{asset_id}/impact",
                        headers=auth_headers, timeout=15)
        _skip(r, "asset-impact")
        assert r.status_code == 200

    def test_asset_impact_has_connections(self, auth_headers):
        asset_id, _ = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/asset/{asset_id}/impact",
                        headers=auth_headers, timeout=15)
        _skip(r, "asset-connections")
        assert r.status_code == 200
        d = r.json()
        assert "connections" in d
        assert "connection_count" in d
        assert d["connection_count"] >= 0

    def test_asset_impact_no_error(self, auth_headers):
        asset_id, _ = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/asset/{asset_id}/impact",
                        headers=auth_headers, timeout=15)
        _skip(r, "asset-no-error")
        assert r.status_code == 200
        assert "error" not in r.json()

    def test_asset_impact_connection_types(self, auth_headers):
        asset_id, _ = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/asset/{asset_id}/impact",
                        headers=auth_headers, timeout=15)
        _skip(r, "asset-types")
        assert r.status_code == 200
        for conn in r.json().get("connections", []):
            assert "type" in conn
            assert "relationship" in conn
            assert conn["type"] in ("work_order", "pm_plan", "asset",
                                    "technician", "supplier")


class TestWOImpact:
    def test_wo_impact_returns_200(self, auth_headers):
        _, wo_id = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/work-order/{wo_id}/impact",
                        headers=auth_headers, timeout=15)
        _skip(r, "wo-impact")
        assert r.status_code == 200

    def test_wo_impact_has_connections(self, auth_headers):
        _, wo_id = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/work-order/{wo_id}/impact",
                        headers=auth_headers, timeout=15)
        _skip(r, "wo-connections")
        assert r.status_code == 200
        d = r.json()
        assert "connections" in d
        assert "work_order" in d

    def test_wo_impact_no_error(self, auth_headers):
        _, wo_id = _get_test_ids()
        r = requests.get(f"{BASE}/api/v1/twin/work-order/{wo_id}/impact",
                        headers=auth_headers, timeout=15)
        _skip(r, "wo-no-error")
        assert r.status_code == 200
        assert "error" not in r.json()

    def test_wo_unknown_returns_404(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/twin/work-order/nonexistent-wo-id/impact",
                        headers=auth_headers, timeout=10)
        _skip(r, "wo-404")
        assert r.status_code == 404


class TestDigitalTwinGate:
    def test_digital_twin_decision_infrastructure(self, auth_headers):
        """
        V6-E03 GATE: Digital Twin as decision infrastructure.
        Proves: asset → impact chain → risk → recommendation → decision.
        """
        asset_id, wo_id = _get_test_ids()
        checks = []

        # State returns health score
        r = requests.get(f"{BASE}/api/v1/twin/state",
                        headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        checks.append(("State health", r.status_code == 200 and
                       0 <= r.json().get("health_score", -1) <= 100))

        # Graph stats returns node counts
        r = requests.get(f"{BASE}/api/v1/twin/graph/stats",
                        headers=auth_headers, timeout=15)
        checks.append(("Graph stats", r.status_code == 200 and
                       "error" not in r.json()))

        # Impact chain returns risk + recommendation
        r = requests.get(f"{BASE}/api/v1/twin/impact-chain/{asset_id}",
                        headers=auth_headers, timeout=15)
        d = r.json() if r.status_code == 200 else {}
        checks.append(("Impact chain", r.status_code == 200 and
                       d.get("risk_level") in VALID_RISK))
        checks.append(("Recommendation", len(d.get("recommendation","")) > 10))

        # Asset connections
        r = requests.get(f"{BASE}/api/v1/twin/asset/{asset_id}/impact",
                        headers=auth_headers, timeout=15)
        checks.append(("Asset impact", r.status_code == 200 and
                       "error" not in r.json()))

        failed = [name for name, ok in checks if not ok]
        assert not failed, f"Digital Twin gate failed: {failed}"
        print(f"\n✅ DIGITAL TWIN 2.0 GATE PASSED")
        print(f"   Risk level: {d.get('risk_level')}")
        print(f"   Chain steps: {len(d.get('impact_chain', []))}")
        print(f"   Recommendation: {d.get('recommendation','')[:60]}")
