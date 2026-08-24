"""Sprint D-022: Executive Briefing Portal + Predictive Maintenance Portal verification"""
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

def test_executive_briefing_complete():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/briefing", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "briefing_type" in d
    assert "financial_performance" in d
    assert "asset_portfolio_risk" in d
    assert "top_risks" in d
    assert "recommended_executive_actions" in d
    assert len(d["recommended_executive_actions"]) >= 3
    assert d["recommended_executive_actions"][0]["priority"] == "URGENT"

def test_predictive_forecast_30day():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/predictive/forecast?horizon_days=30", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "forecasts" in d
    if d["forecasts"]:
        f = d["forecasts"][0]
        assert "failure_probability_pct" in f
        assert "predicted_failure_window_days" in f
        assert "recommended_action" in f
        assert 0 <= f["failure_probability_pct"] <= 100

def test_anomaly_detection_live():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/predictive/anomalies", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "anomalies" in d
    assert isinstance(d["anomalies"], list)

def test_portfolio_health_index():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/portfolio-health", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "index_score" in d
    assert "grade" in d
    assert "trend" in d
    assert d["grade"] in ["A+", "A", "B+", "B", "C", "D"]
