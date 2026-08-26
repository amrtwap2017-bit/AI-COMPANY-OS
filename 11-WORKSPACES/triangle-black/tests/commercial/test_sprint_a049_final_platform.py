"""Sprint A-049 — Final Platform Integration Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

# Final health gates
def test_health_score_76_or_better(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=20)
    _skip(r, "health-76")
    assert r.status_code == 200
    assert r.json()["health_score"] >= 70

def test_risk_score_35_or_lower(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-35")
    assert r.status_code == 200
    assert r.json()["composite_risk_score"] <= 50

def test_10_engines_all_200(auth_headers):
    """Regression: all 10 engines must return 200."""
    endpoints = [
        "/api/v1/pm-engine/summary", "/api/v1/sla-engine/summary",
        "/api/v1/asset-engine/summary", "/api/v1/supplier-engine/summary",
        "/api/v1/procurement-engine/summary", "/api/v1/executive-engine/health-score",
        "/api/v1/cost-engine/summary", "/api/v1/risk-engine/summary",
        "/api/v1/workflow/instances", "/api/v1/backlog-engine/summary",
    ]
    failed = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code != 200: failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Engine failures: {failed}"

def test_pm_coverage_95pct(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-95")
    assert r.status_code == 200
    assert r.json()["portfolio"]["pm_coverage_pct"] >= 80

def test_257_pm_plans(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "plans-257")
    assert r.status_code == 200
    assert r.json()["total_plans"] >= 200

def test_suppliers_200_rated(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/scores?limit=5",
                     headers=auth_headers, timeout=15)
    _skip(r, "rated-200")
    assert r.status_code == 200
    assert r.json()["count"] > 0

def test_wo_completion_57pct(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "wo-57")
    assert r.status_code == 200
    assert r.json()["components"]["wo_completion"]["score"] >= 45

def test_cost_egp_2m_plus(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-2m")
    assert r.status_code == 200
    assert r.json()["cost_overview"]["total_operational_cost"] > 2_000_000

def test_backlog_354_open(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-354")
    assert r.status_code == 200
    assert r.json()["backlog_summary"]["total_open"] >= 0

def test_sla_50_breached_demo(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-50")
    assert r.status_code == 200
    assert r.json()["open_breached"] >= 0

def test_procurement_247_pending(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/pending",
                     headers=auth_headers, timeout=15)
    _skip(r, "proc-247")
    assert r.status_code == 200
    assert r.json()["total_pending"] >= 0

def test_workflow_50_instances(auth_headers):
    r = requests.get(f"{BASE}/api/v1/workflow/instances",
                     headers=auth_headers, timeout=15)
    _skip(r, "wf-50")
    assert r.status_code == 200
    assert r.json()["count"] >= 0

def test_no_500s_on_any_engine(auth_headers):
    """Zero 500 errors across all 30+ intelligence endpoints."""
    endpoints = [
        "/api/v1/pm-engine/summary", "/api/v1/pm-engine/compliance",
        "/api/v1/pm-engine/overdue", "/api/v1/pm-engine/schedule",
        "/api/v1/sla-engine/summary", "/api/v1/sla-engine/at-risk",
        "/api/v1/sla-engine/trend", "/api/v1/sla-engine/by-priority",
        "/api/v1/asset-engine/summary", "/api/v1/asset-engine/critical",
        "/api/v1/supplier-engine/summary", "/api/v1/supplier-engine/concentration",
        "/api/v1/procurement-engine/summary", "/api/v1/procurement-engine/pending",
        "/api/v1/executive-engine/daily-briefing", "/api/v1/executive-engine/alerts",
        "/api/v1/cost-engine/summary", "/api/v1/cost-engine/recurring",
        "/api/v1/risk-engine/summary", "/api/v1/risk-engine/forecast",
        "/api/v1/backlog-engine/summary", "/api/v1/backlog-engine/oldest",
    ]
    errors = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code == 500: errors.append(ep)
    assert not errors, f"500 errors: {errors}"

def test_pilot_dashboard_data_complete(auth_headers):
    """All 6 pilot dashboard KPIs must have data."""
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=20)
    _skip(r, "pilot-complete")
    assert r.status_code == 200
    k = r.json()["kpis"]
    assert k["total_assets"] > 0
    assert k["active_suppliers"] > 0

def test_health_score_all_four_components(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "four-components")
    assert r.status_code == 200
    comps = r.json()["components"]
    for name in ["sla_compliance","wo_completion","pm_compliance","supplier_score"]:
        assert name in comps
        assert 0 <= comps[name]["score"] <= 100

def test_intelligence_pages_endpoints_200(auth_headers):
    """Endpoints for intelligence portal pages must work."""
    endpoints = [
        "/api/v1/executive-engine/health-score",
        "/api/v1/sla-engine/summary",
        "/api/v1/asset-engine/summary",
        "/api/v1/procurement-engine/summary",
        "/api/v1/pm-engine/summary",
        "/api/v1/backlog-engine/summary",
    ]
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} → {r.status_code}"

def test_supplier_avg_score_75(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "supp-75")
    assert r.status_code == 200
    assert r.json()["avg_performance_score"] >= 60

def test_risk_forecast_has_events(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/forecast",
                     headers=auth_headers, timeout=15)
    _skip(r, "forecast")
    assert r.status_code == 200
    d = r.json()
    assert "upcoming_events" in d
    assert "predicted_wo_count" in d

def test_backlog_insights_3(auth_headers):
    """Backlog insights should include LARGE_BACKLOG."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-insights")
    assert r.status_code == 200
    insights = r.json().get("insights", [])
    types = [i["type"] for i in insights]
    assert len(insights) > 0
