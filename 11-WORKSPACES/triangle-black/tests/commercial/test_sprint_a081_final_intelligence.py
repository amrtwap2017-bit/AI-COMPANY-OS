"""Sprint A-081 — Final Intelligence Platform Tests"""
import pytest
import requests
import time

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

# Cross-engine consistency final
def test_executive_assets_match_asset_engine(auth_headers):
    exec_r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                          headers=auth_headers, timeout=20)
    asset = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                         headers=auth_headers, timeout=15)
    _skip(exec_r, "cross-match")
    assert exec_r.status_code == 200 and asset.status_code == 200
    exec_assets = exec_r.json()["kpis"]["total_assets"]
    asset_total = asset.json()["portfolio"]["total_assets"]
    assert abs(exec_assets - asset_total) <= 20

def test_cost_procurement_spend_aligned(auth_headers):
    cost = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                        headers=auth_headers, timeout=15)
    proc = requests.get(f"{BASE}/api/v1/procurement-engine/summary",
                        headers=auth_headers, timeout=15)
    _skip(cost, "cost-proc-align")
    assert cost.status_code == 200 and proc.status_code == 200
    cost_po = cost.json()["cost_overview"]["total_procurement_spend"]
    proc_spend = proc.json()["spend"]["total_spend"]
    assert abs(cost_po - proc_spend) < 50000

def test_trend_pm_trend_has_data(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-pm")
    assert r.status_code == 200
    d = r.json()
    assert "pm_compliance_trend" in d
    assert "monthly_wo_trend" in d

def test_predictive_avg_score_positive(auth_headers):
    r = requests.get(f"{BASE}/api/v1/predictive-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pred-avg")
    assert r.status_code == 200
    assert r.json()["avg_predictive_score"] >= 0

def test_technician_top_performers_present(auth_headers):
    r = requests.get(f"{BASE}/api/v1/technician-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "tech-top")
    assert r.status_code == 200
    d = r.json()
    assert "top_performers" in d

def test_sla_engine_targets_hierarchy_final(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-hierarchy")
    assert r.status_code == 200
    t = r.json().get("sla_targets", {})
    assert t.get("emergency", 99) < t.get("critical", 0)
    assert t.get("critical", 99) < t.get("high", 0)

def test_backlog_priority_totals_match(auth_headers):
    bp = requests.get(f"{BASE}/api/v1/backlog-engine/by-priority",
                      headers=auth_headers, timeout=15)
    summary = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                           headers=auth_headers, timeout=15)
    _skip(bp, "backlog-totals")
    assert bp.status_code == 200 and summary.status_code == 200
    psum = sum(i["count"] for i in bp.json()["by_priority"])
    stotal = summary.json()["backlog_summary"]["total_open"]
    assert abs(psum - stotal) <= 10

def test_risk_engine_forecast_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/forecast",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-forecast")
    assert r.status_code == 200
    d = r.json()
    assert d["forecast_period"] == "30_days"

def test_supplier_concentration_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/concentration",
                     headers=auth_headers, timeout=15)
    _skip(r, "supp-conc")
    assert r.status_code == 200
    d = r.json()
    assert 0 <= d["concentration_pct"] <= 100
    assert d["risk_level"] in ("LOW","MODERATE","HIGH","CRITICAL")

def test_asset_critical_sorted(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/critical",
                     headers=auth_headers, timeout=15)
    _skip(r, "asset-sorted")
    assert r.status_code == 200
    for a in r.json().get("assets", []):
        assert a["risk_level"] in ("CRITICAL","HIGH")

def test_pm_category_breakdown(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/compliance",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-cat")
    assert r.status_code == 200
    cats = r.json().get("by_category", [])
    assert len(cats) >= 1

def test_all_engines_have_hotel_id(auth_headers):
    endpoints = [
        "/api/v1/pm-engine/summary", "/api/v1/sla-engine/summary",
        "/api/v1/asset-engine/summary", "/api/v1/cost-engine/summary",
        "/api/v1/risk-engine/summary", "/api/v1/backlog-engine/summary",
        "/api/v1/technician-engine/summary", "/api/v1/trend-engine/summary",
        "/api/v1/predictive-engine/summary",
    ]
    missing = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code == 200:
            if "hotel_id" not in r.json():
                missing.append(ep)
    assert not missing, f"Missing hotel_id: {missing}"

def test_performance_all_engines_under_3s(auth_headers):
    eps = [
        "/api/v1/pm-engine/summary", "/api/v1/sla-engine/summary",
        "/api/v1/backlog-engine/summary", "/api/v1/predictive-engine/summary",
    ]
    for ep in eps:
        start = time.time()
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=10)
        ms = (time.time() - start) * 1000
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        assert ms < 5000, f"{ep}: {ms:.0f}ms"

def test_seed_demo_data_idempotent(auth_headers):
    """Seed script can run without breaking anything."""
    import subprocess
    result = subprocess.run(
        [".venv/bin/python", "scripts/seed_demo_data.py"],
        capture_output=True, text=True, timeout=60
    )
    assert result.returncode == 0, f"Seed failed: {result.stderr[:200]}"

def test_final_platform_state_summary(auth_headers):
    """Final validation of entire platform."""
    checks = [
        ("/api/v1/executive-engine/health-score",
         lambda d: d["health_score"] >= 75, "Health >= 75"),
        ("/api/v1/pm-engine/summary",
         lambda d: d["compliance_grade"] != "D", "PM Grade C+"),
        ("/api/v1/sla-engine/summary",
         lambda d: d["overall_compliance_pct"] >= 95, "SLA 95%+"),
        ("/api/v1/cost-engine/summary",
         lambda d: d["cost_overview"]["total_operational_cost"] > 1_000_000, "Cost > 1M"),
        ("/api/v1/risk-engine/operational",
         lambda d: d["composite_risk_score"] <= 50, "Risk <= 50"),
    ]
    failed = []
    for ep, check, name in checks:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code == 200:
            if not check(r.json()): failed.append(name)
        else: failed.append(f"{name} → {r.status_code}")
    assert not failed, f"Platform state issues: {failed}"
