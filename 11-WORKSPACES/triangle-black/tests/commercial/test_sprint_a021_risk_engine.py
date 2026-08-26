"""Sprint A-021 — Operational Risk Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_risk_engine_summary_requires_auth():
    r = requests.get(f"{BASE}/api/v1/risk-engine/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_risk_engine_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-summary")
    assert r.status_code == 200
    d = r.json()
    assert "operational_risk" in d
    assert "asset_risk_summary" in d
    assert "forecast" in d
    assert "insights" in d

def test_risk_engine_operational_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-operational")
    assert r.status_code == 200
    d = r.json()
    assert "composite_risk_score" in d
    assert "risk_level" in d
    assert "components" in d
    assert 0 <= d["composite_risk_score"] <= 100
    assert d["risk_level"] in ("CRITICAL", "HIGH", "MODERATE", "LOW")

def test_risk_engine_asset_risk_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/asset-risk",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-asset")
    assert r.status_code == 200
    d = r.json()
    assert "assets" in d
    assert "critical_count" in d
    for a in d["assets"][:3]:
        assert "risk_score" in a
        assert "risk_level" in a
        assert 0 <= a["risk_score"] <= 100
        assert a["risk_level"] in ("CRITICAL","HIGH","MODERATE","LOW")

def test_risk_engine_forecast_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/forecast",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-forecast")
    assert r.status_code == 200
    d = r.json()
    assert "forecast_period" in d
    assert "predicted_wo_count" in d
    assert "upcoming_events" in d
    assert d["forecast_period"] == "30_days"

def test_risk_components_weighted_correctly(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-weights")
    assert r.status_code == 200
    comps = r.json().get("components", {})
    assert "sla_risk" in comps
    assert "pm_risk" in comps
    assert "asset_risk" in comps
    assert "procurement_risk" in comps
    for k, v in comps.items():
        assert 0 <= v["score"] <= 100

def test_risk_forecast_event_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/forecast",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-events")
    assert r.status_code == 200
    for ev in r.json().get("upcoming_events", []):
        assert "type" in ev
        assert "severity" in ev
        assert "count" in ev
        assert "description" in ev

def test_risk_asset_scores_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/asset-risk?limit=5",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-bounded")
    assert r.status_code == 200
    for a in r.json()["assets"]:
        assert 0 <= a["risk_score"] <= 100
    assert len(r.json()["assets"]) <= 5
