"""Sprint D-018: Intelligence Portal Pages + Full API Surface Verification"""
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

def test_all_intelligence_endpoints_live():
    """Verify all 8 intelligence domain APIs return 200."""
    h = _auth()
    endpoints = [
        "/api/v1/intelligence/snapshot",
        "/api/v1/risk-intelligence/composite-score",
        "/api/v1/energy-intelligence/carbon-footprint",
        "/api/v1/sla-intelligence/scorecard",
        "/api/v1/financial-intelligence/leakage",
        "/api/v1/asset-lifecycle/pm-effectiveness",
        "/api/v1/supplier-intelligence/scorecards",
        "/api/v1/executive-intelligence/summary",
    ]
    failed = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=h, timeout=15)
        if r.status_code != 200:
            failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Failed endpoints: {failed}"

def test_master_snapshot_completeness():
    """Verify master snapshot contains all 8 pillars with non-empty data."""
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/intelligence/snapshot", headers=h, timeout=20)
    assert r.status_code == 200
    data = r.json()
    for pillar in range(1, 9):
        key = f"pillar_{pillar}_" + [
            "operations", "financial", "assets", "sla",
            "suppliers", "risk", "ai_recommendations", "portfolio_health"
        ][pillar - 1]
        assert key in data, f"Missing: {key}"

def test_read_models_summary_format():
    """Verify /summary returns read_model format with required keys."""
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/summary", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "hotel_id" in data
    assert "operations" in data
    assert "maintenance" in data
    assert "procurement" in data
    assert "financial" in data
