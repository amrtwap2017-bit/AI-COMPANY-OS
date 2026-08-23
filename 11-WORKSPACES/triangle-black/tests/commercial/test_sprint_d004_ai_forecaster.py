"""
Sprint D-004: AI Predictive Failure Forecaster & Anomaly Pipeline Verification Test
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

def test_failure_forecast_api():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/predictive/forecast?horizon_days=30", headers=h, timeout=10)
    assert r.status_code == 200, f"Forecast failed: {r.text}"
    data = r.json()
    assert "forecasts" in data
    forecasts = data["forecasts"]
    assert isinstance(forecasts, list)
    if len(forecasts) > 0:
        f0 = forecasts[0]
        assert "asset_id" in f0
        assert "failure_probability_pct" in f0
        assert "recommended_action" in f0

def test_anomaly_detection_api():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/predictive/anomalies", headers=h, timeout=10)
    assert r.status_code == 200, f"Anomaly detection failed: {r.text}"
    data = r.json()
    assert "anomalies" in data
    assert isinstance(data["anomalies"], list)
