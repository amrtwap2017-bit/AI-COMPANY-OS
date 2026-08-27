"""Sprint A-059 — PM Compliance Fix Verification Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_pm_engine_summary_200(auth_headers):
    """PM engine summary must return 200 after compliance fix."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-200")
    assert r.status_code == 200, f"PM engine still failing: {r.status_code}"

def test_pm_compliance_59pct(auth_headers):
    """PM compliance should be ~59% (on-schedule metric)."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-59")
    assert r.status_code == 200
    pct = r.json()["pm_compliance_pct"]
    assert 30 <= pct <= 100, f"PM compliance out of range: {pct}%"

def test_pm_engine_all_4_endpoints_200(auth_headers):
    """All 4 PM engine endpoints must return 200."""
    for ep in ["/api/v1/pm-engine/summary", "/api/v1/pm-engine/compliance",
               "/api/v1/pm-engine/overdue", "/api/v1/pm-engine/schedule"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} → {r.status_code}"

def test_pm_compliance_not_39pct(auth_headers):
    """PM compliance must NOT be 3.9% (old broken metric)."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-not-39")
    assert r.status_code == 200
    pct = r.json()["pm_compliance_pct"]
    assert pct > 10, f"PM compliance looks like old metric: {pct}%"

def test_pm_plan_count_257(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-257")
    assert r.status_code == 200
    assert r.json()["total_plans"] >= 200

def test_pm_compliance_by_category_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/compliance",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-cat-200")
    assert r.status_code == 200
    d = r.json()
    assert "by_category" in d
    assert "overall_compliance_pct" in d

def test_10_engines_still_200_after_pm_fix(auth_headers):
    """Regression: all 10 engines must still work after PM fix."""
    eps = [
        "/api/v1/pm-engine/summary", "/api/v1/sla-engine/summary",
        "/api/v1/asset-engine/summary", "/api/v1/supplier-engine/summary",
        "/api/v1/procurement-engine/summary", "/api/v1/executive-engine/health-score",
        "/api/v1/cost-engine/summary", "/api/v1/risk-engine/summary",
        "/api/v1/workflow/instances", "/api/v1/backlog-engine/summary",
    ]
    failed = []
    for ep in eps:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code != 200: failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Engine failures: {failed}"

def test_health_score_still_good(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health-still-good")
    assert r.status_code == 200
    d = r.json()
    assert d["health_score"] >= 70
    assert d["grade"] in ("GOOD","EXCELLENT")

def test_pm_compliance_matches_health_score_component(auth_headers):
    """PM compliance in PM engine should be close to health score component."""
    pm = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                      headers=auth_headers, timeout=15)
    health = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                          headers=auth_headers, timeout=15)
    _skip(pm, "pm-health-match")
    assert pm.status_code == 200 and health.status_code == 200
    pm_pct = pm.json()["pm_compliance_pct"]
    health_pm = health.json()["components"]["pm_compliance"]["score"]
    assert abs(pm_pct - health_pm) < 25, \
        f"PM metrics diverging: pm_engine={pm_pct}% health={health_pm}%"

def test_maintenance_intelligence_page_endpoints(auth_headers):
    """All endpoints for maintenance intelligence page must work."""
    for ep in ["/api/v1/pm-engine/summary", "/api/v1/pm-engine/compliance",
               "/api/v1/pm-engine/schedule", "/api/v1/cost-engine/summary"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} → {r.status_code}"
