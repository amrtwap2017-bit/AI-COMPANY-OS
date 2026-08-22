"""
Sprint P-010: AI Operational Intelligence & Predictive Maintenance Test Suite
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

def test_ai_maintenance_director_unit():
    from src.commercial.predictive_maintenance.director import AIMaintenanceDirector

    # High Risk Scenario: 4 failures + vibration spike
    res_high = AIMaintenanceDirector.analyze_asset_health(
        asset_id="chiller-01",
        hotel_id="hotel-123",
        asset_name="Main Chiller Unit",
        failures_90d=4,
        pm_compliance=70.0,
        vibration_spike=True
    )
    assert res_high["risk_level"] == "HIGH"
    assert res_high["required_approval_role"] == "manager"
    assert res_high["auto_work_order_suggested"] is True
    assert len(res_high["evidence"]) >= 2
    assert res_high["confidence_score"] >= 0.85

    # Low Risk Scenario: 0 failures, 100% PM compliance, normal vibration
    res_low = AIMaintenanceDirector.analyze_asset_health(
        asset_id="pump-02",
        hotel_id="hotel-123",
        asset_name="Secondary Water Pump",
        failures_90d=0,
        pm_compliance=100.0,
        vibration_spike=False
    )
    assert res_low["risk_level"] == "LOW"
    assert res_low["auto_work_order_suggested"] is False

def test_ai_maintenance_director_api_endpoint():
    h = _auth()
    payload = {
        "asset_id": "ast-hvac-99",
        "asset_name": "Rooftop AHU-4",
        "failures_90d": 3,
        "pm_compliance": 65.0,
        "vibration_spike": True
    }
    r = requests.post(f"{BASE}/api/v1/predictive-maintenance/director/analyze", json=payload, headers=h, timeout=10)
    assert r.status_code == 200
    data = r.json()

    assert data["risk_level"] == "HIGH"
    assert "evidence" in data and len(data["evidence"]) > 0
    assert data["governance_status"] == "governed_advisory"
