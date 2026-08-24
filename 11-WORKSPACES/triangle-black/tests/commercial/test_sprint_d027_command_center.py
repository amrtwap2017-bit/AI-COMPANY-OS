"""Sprint D-027: Operational Command Center — full intelligence API surface verification"""
import requests

BASE = "http://localhost:8030"
_C = {}

def _auth():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_complete_intelligence_api_surface():
    """Verify all intelligence module APIs return 200 — powers command center."""
    h = _auth()
    endpoints = [
        "/api/v1/intelligence/snapshot",
        "/api/v1/risk-intelligence/composite-score",
        "/api/v1/risk-intelligence/domain-scores",
        "/api/v1/energy-intelligence/carbon-footprint",
        "/api/v1/sla-intelligence/scorecard",
        "/api/v1/financial-intelligence/leakage",
        "/api/v1/asset-lifecycle/pm-effectiveness",
        "/api/v1/supplier-intelligence/scorecards",
        "/api/v1/executive-intelligence/summary",
        "/api/v1/predictive/forecast",
        "/api/v1/predictive/anomalies",
        "/api/v1/demo/walkthrough",
        "/api/v1/commercial-value/certification",
        "/api/v1/production-gate/readiness",
        "/api/v1/production-gate/pilot-summary",
        "/api/v1/pilot-control/status",
        "/api/v1/plans/my-entitlements",
        "/api/v1/integrations/webhooks/subscriptions",
        "/api/v1/sso/config",
        "/api/v1/scim/v2/Users",
    ]
    failed = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=h, timeout=15)
        if r.status_code != 200:
            failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Failed: {failed}"

def test_master_snapshot_8_pillars():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/intelligence/snapshot", headers=h, timeout=20)
    assert r.status_code == 200
    d = r.json()
    assert d["snapshot_type"] == "MASTER_INTELLIGENCE_SNAPSHOT"
    for i in range(1, 9):
        pillar_key = f"pillar_{i}_" + ["operations","financial","assets","sla","suppliers","risk","ai_recommendations","portfolio_health"][i-1]
        assert pillar_key in d, f"Missing: {pillar_key}"
    summary = d["intelligence_summary"]
    assert "overall_platform_verdict" in summary
    assert "active_risk_count" in summary

def test_production_platform_status():
    h = _auth()
    r1 = requests.get(f"{BASE}/api/v1/production-gate/readiness", headers=h, timeout=15)
    assert r1.status_code == 200
    assert r1.json()["failed"] == 0

    r2 = requests.get(f"{BASE}/api/v1/pilot-control/status", headers=h, timeout=15)
    assert r2.status_code == 200
    assert len(r2.json()["pilots"]) >= 3
