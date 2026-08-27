"""Sprint A-069+A-070 — Technician + Trend Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_technician_engine_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/technician-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "tech-summary")
    assert r.status_code == 200
    d = r.json()
    assert "total_technicians" in d
    assert "avg_efficiency_score" in d
    assert "grade_distribution" in d

def test_technician_engine_scores_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/technician-engine/scores",
                     headers=auth_headers, timeout=20)
    _skip(r, "tech-scores")
    assert r.status_code == 200
    d = r.json()
    assert "technicians" in d
    for t in d["technicians"][:3]:
        assert "efficiency_score" in t
        assert 0 <= t["efficiency_score"] <= 100
        assert t["grade"] in ("EXCELLENT","GOOD","ACCEPTABLE","NEEDS_IMPROVEMENT")

def test_technician_requires_auth():
    r = requests.get(f"{BASE}/api/v1/technician-engine/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_trend_engine_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "trend-summary")
    assert r.status_code == 200
    d = r.json()
    assert "monthly_wo_trend" in d
    assert "pm_compliance_trend" in d
    assert "spend_trend" in d

def test_trend_engine_compare_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/compare",
                     headers=auth_headers, timeout=20)
    _skip(r, "trend-compare")
    assert r.status_code == 200
    d = r.json()
    assert "current_month" in d
    assert "trends" in d

def test_trend_engine_monthly_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/monthly?months=3",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-monthly")
    assert r.status_code == 200
    d = r.json()
    assert "data" in d
    for month in d["data"]:
        assert "month" in month
        assert "completed_wos" in month
        assert 0 <= month["completion_rate_pct"] <= 100

def test_trend_engine_spend_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/spend",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-spend")
    assert r.status_code == 200
    d = r.json()
    assert "data" in d

def test_trend_compare_directions_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/compare",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-dir")
    assert r.status_code == 200
    for k, v in r.json().get("trends", {}).items():
        assert v.get("direction") in ("UP", "DOWN")

def test_now_12_intelligence_engines(auth_headers):
    """After A-069+A-070, platform has 12 intelligence engines."""
    endpoints = [
        "/api/v1/pm-engine/summary", "/api/v1/sla-engine/summary",
        "/api/v1/asset-engine/summary", "/api/v1/supplier-engine/summary",
        "/api/v1/procurement-engine/summary", "/api/v1/executive-engine/health-score",
        "/api/v1/cost-engine/summary", "/api/v1/risk-engine/summary",
        "/api/v1/backlog-engine/summary", "/api/v1/workflow/instances",
        "/api/v1/technician-engine/summary",
        "/api/v1/trend-engine/summary",
    ]
    failed = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code != 200: failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Engine failures: {failed}"

def test_health_score_still_good(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health-still")
    assert r.status_code == 200
    assert r.json()["health_score"] >= 70
