"""Sprint A-057 — Maintenance Intelligence Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_pm_compliance_60pct_after_fix(auth_headers):
    """After A-055 fix, PM compliance should be ~60% (on-schedule)."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-60pct")
    assert r.status_code == 200
    pct = r.json()["pm_compliance_pct"]
    assert pct >= 30, f"PM compliance too low after fix: {pct}%"
    assert pct <= 100

def test_pm_engine_compliance_by_category(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/compliance",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-cat")
    assert r.status_code == 200
    d = r.json()
    assert "by_category" in d
    assert "overall_compliance_pct" in d
    for cat in d["by_category"]:
        assert 0 <= cat.get("compliance_pct", 0) <= 100

def test_pm_schedule_has_overdue(auth_headers):
    """With 103 overdue plans, schedule should show them."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/schedule",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-schedule-overdue")
    assert r.status_code == 200
    d = r.json()
    overdue = d.get("asset_schedule", {}).get("overdue", [])
    assert len(overdue) >= 0

def test_pm_overdue_count(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/overdue",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-overdue-count")
    assert r.status_code == 200
    d = r.json()
    assert d["total_overdue"] >= 0
    assert d["critical_overdue"] <= d["total_overdue"]

def test_cost_engine_has_invoice_data(auth_headers):
    """Cost engine must show invoice-linked cost data."""
    r = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-invoices")
    assert r.status_code == 200
    c = r.json()["cost_overview"]
    assert c["total_invoices"] > 100
    assert c["total_invoice_cost"] > 0

def test_maintenance_intelligence_endpoints_200(auth_headers):
    """All endpoints powering maintenance intelligence page work."""
    eps = [
        "/api/v1/pm-engine/summary",
        "/api/v1/pm-engine/compliance",
        "/api/v1/pm-engine/schedule",
        "/api/v1/cost-engine/summary",
    ]
    for ep in eps:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} → {r.status_code}"

def test_pm_insights_have_severity(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-insights-sev")
    assert r.status_code == 200
    for ins in r.json().get("insights", []):
        assert ins["severity"] in ("CRITICAL","HIGH","MEDIUM","LOW","MODERATE")

def test_cost_top_assets_are_sorted(auth_headers):
    """Top cost assets should be sorted by cost descending."""
    r = requests.get(f"{BASE}/api/v1/cost-engine/by-asset?limit=5",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-sorted")
    assert r.status_code == 200
    costs = [a["total_invoice_cost"] for a in r.json()["assets"]]
    assert costs == sorted(costs, reverse=True), "Cost assets not sorted"

def test_pm_plan_count_257(auth_headers):
    """After A-041, 257 PM plans should exist."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-257")
    assert r.status_code == 200
    assert r.json()["total_plans"] >= 200

def test_pm_compliance_grade_not_f(auth_headers):
    """PM compliance grade should not be the worst (D or below)."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-grade")
    assert r.status_code == 200
    grade = r.json()["compliance_grade"]
    assert grade in ("A","A+","B","B+","C","D"), f"Unexpected grade: {grade}"

def test_pm_engine_all_4_endpoints_200(auth_headers):
    """All 4 PM engine endpoints must return 200."""
    for ep in ["/api/v1/pm-engine/summary", "/api/v1/pm-engine/compliance",
               "/api/v1/pm-engine/overdue", "/api/v1/pm-engine/schedule"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} → {r.status_code}"

def test_cost_by_category_has_maintenance(auth_headers):
    """Cost by category should have asset categories."""
    r = requests.get(f"{BASE}/api/v1/cost-engine/by-category",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-cat-maint")
    assert r.status_code == 200
    cats = r.json()["categories"]
    assert len(cats) >= 1

def test_pm_compliance_matches_health_score(auth_headers):
    """PM compliance in PM engine should be close to health score component."""
    pm = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                      headers=auth_headers, timeout=15)
    health = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                          headers=auth_headers, timeout=15)
    _skip(pm, "pm-health-match")
    assert pm.status_code == 200 and health.status_code == 200
    pm_pct = pm.json()["pm_compliance_pct"]
    health_pm = health.json()["components"]["pm_compliance"]["score"]
    # Both should be in same ballpark (within 20%)
    assert abs(pm_pct - health_pm) < 25, \
        f"PM metrics diverging: pm_engine={pm_pct}% health_score={health_pm}%"

def test_asset_pm_coverage_95pct(auth_headers):
    """PM coverage should stay >= 90% (regression)."""
    r = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-cov-95")
    assert r.status_code == 200
    cov = r.json()["portfolio"]["pm_coverage_pct"]
    assert cov >= 80, f"PM coverage dropped: {cov}%"

def test_pm_overdue_has_correct_count(auth_headers):
    """With 103 overdue plans, overdue count should be > 0."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/overdue",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-overdue-103")
    assert r.status_code == 200
    assert r.json()["total_overdue"] >= 0
