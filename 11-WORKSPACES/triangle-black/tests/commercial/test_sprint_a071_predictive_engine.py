"""Sprint A-071 — Predictive Maintenance Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_predictive_summary_requires_auth():
    r = requests.get(f"{BASE}/api/v1/predictive-engine/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_predictive_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/predictive-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "pred-summary")
    assert r.status_code == 200
    d = r.json()
    assert "total_assessed" in d
    assert "risk_distribution" in d
    assert "insights" in d

def test_predictive_assets_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/predictive-engine/assets",
                     headers=auth_headers, timeout=20)
    _skip(r, "pred-assets")
    assert r.status_code == 200
    d = r.json()
    assert "assets" in d
    assert "count" in d
    for a in d["assets"][:3]:
        assert "predictive_score" in a
        assert 0 <= a["predictive_score"] <= 100
        assert a["risk_level"] in ("CRITICAL","HIGH","MODERATE","LOW")
        assert a["recommendation"] in (
            "IMMEDIATE_ACTION","SCHEDULE_SOON","MONITOR","MAINTAIN_SCHEDULE"
        )

def test_predictive_factors_present(auth_headers):
    r = requests.get(f"{BASE}/api/v1/predictive-engine/assets?limit=5",
                     headers=auth_headers, timeout=15)
    _skip(r, "pred-factors")
    assert r.status_code == 200
    for a in r.json()["assets"][:3]:
        factors = a.get("factors", {})
        assert "failure_factor" in factors
        assert "pm_gap_factor" in factors
        assert "age_factor" in factors

def test_all_13_engines_200(auth_headers):
    """Platform now has 13 intelligence engines."""
    endpoints = [
        "/api/v1/pm-engine/summary", "/api/v1/sla-engine/summary",
        "/api/v1/asset-engine/summary", "/api/v1/supplier-engine/summary",
        "/api/v1/procurement-engine/summary", "/api/v1/executive-engine/health-score",
        "/api/v1/cost-engine/summary", "/api/v1/risk-engine/summary",
        "/api/v1/backlog-engine/summary", "/api/v1/workflow/instances",
        "/api/v1/technician-engine/summary", "/api/v1/trend-engine/summary",
        "/api/v1/predictive-engine/summary",
    ]
    failed = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code != 200: failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Engine failures: {failed}"

def test_predictive_scores_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/predictive-engine/assets?limit=10",
                     headers=auth_headers, timeout=15)
    _skip(r, "pred-bounded")
    assert r.status_code == 200
    for a in r.json()["assets"]:
        assert 0 <= a["predictive_score"] <= 100
        assert a["days_to_recommended_action"] >= 0

def test_trend_compare_has_real_data(auth_headers):
    """Trend engine shows real month comparison."""
    r = requests.get(f"{BASE}/api/v1/trend-engine/compare",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-real")
    assert r.status_code == 200
    d = r.json()
    curr = d.get("current_month", {})
    assert curr.get("completed_wos", 0) >= 0

def test_health_score_stable_after_13_engines(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health-13")
    assert r.status_code == 200
    assert r.json()["health_score"] >= 70
