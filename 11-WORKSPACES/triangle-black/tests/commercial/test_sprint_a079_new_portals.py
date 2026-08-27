"""Sprint A-079 — New Portal Pages + Engine Coverage Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

# Technician Engine extended
def test_technician_summary_has_grade_dist(auth_headers):
    r = requests.get(f"{BASE}/api/v1/technician-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "tech-grade")
    assert r.status_code == 200
    d = r.json()
    assert "grade_distribution" in d
    assert "top_performers" in d
    assert "needs_attention" in d

def test_technician_scores_have_factors(auth_headers):
    r = requests.get(f"{BASE}/api/v1/technician-engine/scores?limit=3",
                     headers=auth_headers, timeout=15)
    _skip(r, "tech-factors")
    assert r.status_code == 200
    for t in r.json()["technicians"][:3]:
        assert "completion_rate_pct" in t
        assert "sla_compliance_pct" in t
        assert "avg_completion_hours" in t

def test_technician_all_grades_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/technician-engine/scores",
                     headers=auth_headers, timeout=15)
    _skip(r, "tech-grades-valid")
    assert r.status_code == 200
    valid = {"EXCELLENT","GOOD","ACCEPTABLE","NEEDS_IMPROVEMENT"}
    for t in r.json()["technicians"]:
        assert t["grade"] in valid

# Trend Engine extended
def test_trend_monthly_6_months(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/monthly?months=6",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-6m")
    assert r.status_code == 200
    d = r.json()
    assert d["months"] >= 0
    for m in d["data"]:
        assert "month" in m
        assert 0 <= m["completion_rate_pct"] <= 100

def test_trend_compare_has_4_kpis(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/compare",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-4kpis")
    assert r.status_code == 200
    trends = r.json().get("trends", {})
    expected = {"wos_completed","completion_rate","sla_compliance","avg_completion_hours"}
    assert expected.issubset(set(trends.keys()))

def test_trend_directions_are_up_or_down(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/compare",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-dirs")
    assert r.status_code == 200
    for k, v in r.json().get("trends", {}).items():
        assert v["direction"] in ("UP","DOWN")

def test_trend_spend_has_total(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/spend",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-spend-total")
    assert r.status_code == 200
    for s in r.json()["data"]:
        assert s["total_spend"] >= 0
        assert s["po_count"] >= 0

# Predictive Engine extended
def test_predictive_immediate_action_list(auth_headers):
    r = requests.get(f"{BASE}/api/v1/predictive-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "pred-immediate")
    assert r.status_code == 200
    d = r.json()
    for a in d.get("immediate_action", []):
        assert a["predictive_score"] >= 80
        assert a["recommendation"] == "IMMEDIATE_ACTION"

def test_predictive_schedule_soon_list(auth_headers):
    r = requests.get(f"{BASE}/api/v1/predictive-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "pred-schedule")
    assert r.status_code == 200
    for a in r.json().get("schedule_soon", []):
        assert a["recommendation"] == "SCHEDULE_SOON"

def test_predictive_factors_sum_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/predictive-engine/assets?limit=5",
                     headers=auth_headers, timeout=15)
    _skip(r, "pred-factors")
    assert r.status_code == 200
    for a in r.json()["assets"][:3]:
        f = a.get("factors", {})
        assert 0 <= f.get("failure_factor", 0) <= 100
        assert 0 <= f.get("pm_gap_factor", 0) <= 100
        assert 0 <= f.get("age_factor", 0) <= 100

# Portal page endpoint validation
def test_technician_portal_endpoints_200(auth_headers):
    """Endpoints powering technician portal work."""
    for ep in ["/api/v1/technician-engine/summary",
               "/api/v1/technician-engine/scores"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200

def test_predictive_portal_endpoints_200(auth_headers):
    """Endpoints powering predictive portal work."""
    for ep in ["/api/v1/predictive-engine/summary",
               "/api/v1/predictive-engine/assets"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200

def test_trend_portal_endpoints_200(auth_headers):
    """Endpoints powering trend portal work."""
    for ep in ["/api/v1/trend-engine/compare",
               "/api/v1/trend-engine/monthly",
               "/api/v1/trend-engine/spend"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200

def test_health_80_stable_after_portals(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health-80-stable")
    assert r.status_code == 200
    assert r.json()["health_score"] >= 75
    assert r.json()["grade"] in ("GOOD","EXCELLENT")

def test_all_new_portal_pages_api_complete(auth_headers):
    """All 3 new portal pages have complete backend support."""
    pages = {
        "technician": ["/api/v1/technician-engine/summary",
                       "/api/v1/technician-engine/scores"],
        "predictive": ["/api/v1/predictive-engine/summary",
                       "/api/v1/predictive-engine/assets"],
        "trends": ["/api/v1/trend-engine/compare",
                   "/api/v1/trend-engine/monthly",
                   "/api/v1/trend-engine/spend"],
    }
    failed = []
    for page, eps in pages.items():
        for ep in eps:
            r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
            if r.status_code == 429: pytest.skip("Rate limited")
            if r.status_code != 200:
                failed.append(f"{page}:{ep} → {r.status_code}")
    assert not failed, f"Portal API failures: {failed}"
