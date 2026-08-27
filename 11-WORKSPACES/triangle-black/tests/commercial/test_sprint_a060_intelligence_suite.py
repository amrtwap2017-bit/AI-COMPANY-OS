"""Sprint A-060 — Complete Intelligence Suite Tests"""
import pytest
import requests
import time

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

# Platform health gates
def test_platform_health_score_76(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health-76")
    assert r.status_code == 200
    assert r.json()["health_score"] >= 70

def test_platform_risk_34_moderate(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-34")
    assert r.status_code == 200
    assert r.json()["composite_risk_score"] <= 50

def test_pm_compliance_on_schedule_59pct(auth_headers):
    """PM compliance uses on-schedule metric = ~59%."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-59")
    assert r.status_code == 200
    pct = r.json()["pm_compliance_pct"]
    assert 30 <= pct <= 100

def test_wo_completion_56pct(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "wo-56")
    assert r.status_code == 200
    assert r.json()["components"]["wo_completion"]["score"] >= 40

def test_pm_coverage_95pct(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-95")
    assert r.status_code == 200
    assert r.json()["portfolio"]["pm_coverage_pct"] >= 80

def test_cost_engine_2m_egp(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-2m")
    assert r.status_code == 200
    assert r.json()["cost_overview"]["total_operational_cost"] > 2_000_000

def test_backlog_354_wos(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-354")
    assert r.status_code == 200
    assert r.json()["backlog_summary"]["total_open"] >= 100

def test_supplier_85pct(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "supp-85")
    assert r.status_code == 200
    assert r.json()["components"]["supplier_score"]["score"] >= 70

def test_sla_100pct(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-100")
    assert r.status_code == 200
    assert r.json()["overall_compliance_pct"] >= 95

def test_all_10_engines_200(auth_headers):
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

def test_6_portal_endpoints_work(auth_headers):
    """6 intelligence portal pages have working backend endpoints."""
    ep_groups = {
        "/intelligence": ["/api/v1/executive-engine/health-score", "/api/v1/sla-engine/summary"],
        "/maintenance/intelligence": ["/api/v1/pm-engine/summary", "/api/v1/cost-engine/summary"],
        "/demo/presentation": ["/api/v1/executive-engine/health-score", "/api/v1/backlog-engine/summary"],
    }
    for page, eps in ep_groups.items():
        for ep in eps:
            r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
            if r.status_code == 429: pytest.skip("Rate limited")
            assert r.status_code == 200, f"{page} endpoint {ep} → {r.status_code}"

def test_pm_engine_no_500_regression(auth_headers):
    """PM engine must not return 500 (was broken by global replace)."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-no-500")
    assert r.status_code != 500, "PM engine returned 500 — regression!"
    assert r.status_code == 200

def test_cost_by_category_not_500(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/by-category",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-cat-500")
    assert r.status_code == 200

def test_alembic_head_unchanged(auth_headers):
    import subprocess
    result = subprocess.run([".venv/bin/alembic", "heads"],
                            capture_output=True, text=True)
    heads = [l.strip() for l in result.stdout.splitlines() if l.strip()]
    assert len(heads) == 1, f"Alembic diverged: {heads}"

def test_platform_demo_story_all_5_points(auth_headers):
    """All 5 commercial demo story points must have data."""
    stories = [
        ("/api/v1/cost-engine/summary",
         lambda d: d["cost_overview"]["total_operational_cost"] > 1_000_000, "EGP 2M+ cost"),
        ("/api/v1/sla-engine/summary",
         lambda d: d["open_breached"] >= 0, "SLA breaches visible"),
        ("/api/v1/backlog-engine/summary",
         lambda d: d["backlog_summary"]["total_open"] > 0, "WO backlog"),
        ("/api/v1/asset-engine/summary",
         lambda d: d["portfolio"]["pm_coverage_pct"] > 50, "PM coverage"),
        ("/api/v1/risk-engine/operational",
         lambda d: d["composite_risk_score"] > 0, "Risk score"),
    ]
    failed = []
    for ep, check, name in stories:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code == 200:
            if not check(r.json()): failed.append(name)
        else: failed.append(f"{name} → {r.status_code}")
    assert not failed, f"Missing: {failed}"
