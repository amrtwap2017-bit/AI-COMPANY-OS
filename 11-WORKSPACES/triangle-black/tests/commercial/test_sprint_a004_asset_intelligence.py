"""Sprint A-004 — Asset Intelligence Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_asset_intel_summary_requires_auth():
    r = requests.get(f"{BASE}/api/v1/asset-intelligence/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_asset_intel_scores_requires_auth():
    r = requests.get(f"{BASE}/api/v1/asset-intelligence/scores", timeout=10)
    assert r.status_code in (401, 403)

def test_asset_intel_summary_returns_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-intelligence/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "ai-summary")
    assert r.status_code == 200
    data = r.json()
    assert "fleet_health_score" in data
    assert "total_assets" in data
    assert "maintenance_alerts" in data
    assert "insights" in data
    assert 0 <= data["fleet_health_score"] <= 100

def test_asset_intel_scores_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-intelligence/scores?limit=10",
                     headers=auth_headers, timeout=20)
    _skip(r, "ai-scores")
    assert r.status_code == 200
    data = r.json()
    assert "assets" in data
    assert "count" in data
    if data["assets"]:
        a = data["assets"][0]
        assert "health_score" in a
        assert "grade" in a
        assert "risk_level" in a
        assert 0 <= a["health_score"] <= 100
        assert a["grade"] in ("A", "B", "C", "D")
        assert a["risk_level"] in ("LOW", "MODERATE", "HIGH", "CRITICAL")

def test_asset_intel_at_risk(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-intelligence/at-risk",
                     headers=auth_headers, timeout=20)
    _skip(r, "ai-at-risk")
    assert r.status_code == 200
    data = r.json()
    assert "at_risk_count" in data
    assert "assets" in data
    assert data["at_risk_count"] >= 0

def test_asset_intel_alerts(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-intelligence/alerts",
                     headers=auth_headers, timeout=20)
    _skip(r, "ai-alerts")
    assert r.status_code == 200
    data = r.json()
    assert "overdue_count" in data
    assert "due_week_count" in data
    assert "due_month_count" in data
    assert "total_alerts" in data

def test_asset_intel_scores_sorted_by_health(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-intelligence/scores?limit=20",
                     headers=auth_headers, timeout=20)
    _skip(r, "ai-sorted")
    assert r.status_code == 200
    assets = r.json().get("assets", [])
    if len(assets) >= 2:
        scores = [a["health_score"] for a in assets]
        assert scores == sorted(scores), "Assets should be sorted ascending by health score"

def test_asset_intel_insights_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-intelligence/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "ai-insights")
    assert r.status_code == 200
    insights = r.json().get("insights", [])
    for insight in insights:
        assert "type" in insight
        assert "severity" in insight
        assert "message" in insight
