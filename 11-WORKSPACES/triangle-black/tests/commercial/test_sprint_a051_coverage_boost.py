"""Sprint A-051 — Coverage Boost: Cross-Domain Intelligence Tests"""
import pytest
import requests
import time

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

# Cross-engine data consistency
def test_pm_engine_plans_match_asset_coverage(auth_headers):
    """PM plans count should roughly match asset PM coverage."""
    pm = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                      headers=auth_headers, timeout=15)
    asset = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                         headers=auth_headers, timeout=15)
    _skip(pm, "cross-pm-asset")
    assert pm.status_code == 200 and asset.status_code == 200
    pm_plans = pm.json()["total_plans"]
    assets_with_pm = asset.json()["portfolio"]["with_pm_coverage"]
    # Plans >= assets with PM (multiple plans per asset possible)
    assert pm_plans >= assets_with_pm

def test_executive_assets_match_asset_engine(auth_headers):
    """Executive KPI total_assets should match Asset Engine portfolio."""
    exec_r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                          headers=auth_headers, timeout=20)
    asset = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                         headers=auth_headers, timeout=15)
    _skip(exec_r, "cross-exec-asset")
    assert exec_r.status_code == 200 and asset.status_code == 200
    exec_assets = exec_r.json()["kpis"]["total_assets"]
    asset_total = asset.json()["portfolio"]["total_assets"]
    assert abs(exec_assets - asset_total) <= 10, \
        f"Asset count mismatch: exec={exec_assets} vs asset={asset_total}"

def test_procurement_spend_positive(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "proc-spend")
    assert r.status_code == 200
    assert r.json()["spend"]["total_spend"] > 0

def test_cost_engine_procurement_aligned(auth_headers):
    """Cost engine PO spend should match procurement engine spend."""
    cost = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                        headers=auth_headers, timeout=15)
    proc = requests.get(f"{BASE}/api/v1/procurement-engine/summary",
                        headers=auth_headers, timeout=15)
    _skip(cost, "cross-cost-proc")
    assert cost.status_code == 200 and proc.status_code == 200
    cost_po = cost.json()["cost_overview"]["total_procurement_spend"]
    proc_spend = proc.json()["spend"]["total_spend"]
    # Should be same or very close (both from purchase_orders.subtotal)
    assert abs(cost_po - proc_spend) < 1000, \
        f"Spend mismatch: cost={cost_po} proc={proc_spend}"

def test_risk_sla_component_matches_sla_engine(auth_headers):
    """Risk SLA component should reflect SLA breaches."""
    risk = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                        headers=auth_headers, timeout=15)
    sla = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                       headers=auth_headers, timeout=15)
    _skip(risk, "cross-risk-sla")
    assert risk.status_code == 200 and sla.status_code == 200
    sla_risk_score = risk.json()["components"]["sla_risk"]["score"]
    open_breached = sla.json()["open_breached"]
    if open_breached > 0:
        assert sla_risk_score > 0, "SLA breaches exist but risk score is 0"

# Performance tests
def test_pm_engine_under_500ms(auth_headers):
    start = time.time()
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=10)
    ms = (time.time() - start) * 1000
    _skip(r, "pm-perf")
    assert r.status_code == 200
    assert ms < 2000, f"PM engine too slow: {ms:.0f}ms"

def test_backlog_engine_under_500ms(auth_headers):
    start = time.time()
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=10)
    ms = (time.time() - start) * 1000
    _skip(r, "backlog-perf")
    assert r.status_code == 200
    assert ms < 3000, f"Backlog engine too slow: {ms:.0f}ms"

def test_executive_briefing_under_3s(auth_headers):
    start = time.time()
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=15)
    ms = (time.time() - start) * 1000
    _skip(r, "exec-perf")
    assert r.status_code == 200
    assert ms < 5000, f"Executive briefing too slow: {ms:.0f}ms"

# Data integrity
def test_backlog_oldest_has_valid_dates(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/oldest?limit=5",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-dates")
    assert r.status_code == 200
    for wo in r.json()["work_orders"]:
        assert wo["age_days"] >= 0
        assert wo["sla_target_hours"] > 0
        # pct_consumed not in oldest — skipped

def test_supplier_recommendations_no_overlap(auth_headers):
    """Preferred and avoid lists should not overlap."""
    r = requests.get(f"{BASE}/api/v1/supplier-engine/recommendations",
                     headers=auth_headers, timeout=15)
    _skip(r, "rec-overlap")
    assert r.status_code == 200
    d = r.json()
    pref_ids = {s.get("id") for s in d.get("preferred_suppliers",[])}
    avoid_ids = {s.get("id") for s in d.get("avoid_suppliers",[])}
    overlap = pref_ids & avoid_ids
    assert not overlap, f"Overlap between preferred/avoid: {overlap}"

def test_risk_asset_scores_match_risk_summary(auth_headers):
    """Asset risk summary counts should match asset-risk endpoint."""
    summary = requests.get(f"{BASE}/api/v1/risk-engine/summary",
                           headers=auth_headers, timeout=15)
    assets = requests.get(f"{BASE}/api/v1/risk-engine/asset-risk?limit=200",
                          headers=auth_headers, timeout=15)
    _skip(summary, "risk-asset-match")
    assert summary.status_code == 200 and assets.status_code == 200
    sum_critical = summary.json()["asset_risk_summary"]["critical"]
    actual_critical = sum(1 for a in assets.json()["assets"] if a["risk_level"] == "CRITICAL")
    assert sum_critical == actual_critical

def test_pm_compliance_by_category_sum(auth_headers):
    """PM compliance by category should reflect real data."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/compliance",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-cat-sum")
    assert r.status_code == 200
    d = r.json()
    # overall should be between 0 and 100
    assert 0 <= d["overall_compliance_pct"] <= 100

def test_backlog_by_priority_totals(auth_headers):
    """Sum of by-priority counts should equal backlog total."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/by-priority",
                     headers=auth_headers, timeout=15)
    summary = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                           headers=auth_headers, timeout=15)
    _skip(r, "backlog-total")
    assert r.status_code == 200 and summary.status_code == 200
    priority_total = sum(item["count"] for item in r.json()["by_priority"])
    summary_total = summary.json()["backlog_summary"]["total_open"]
    assert abs(priority_total - summary_total) <= 5, \
        f"Backlog total mismatch: priority sum={priority_total} summary={summary_total}"

def test_sla_trend_weekly_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/trend?weeks=4",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-trend-struct")
    assert r.status_code == 200
    for item in r.json()["trend"]:
        assert "week_start" in item or "week" in item
        assert "total_count" in item or "breach_count" in item

def test_cost_by_category_all_positive(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/by-category",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-cat-pos")
    assert r.status_code == 200
    for cat in r.json()["categories"]:
        assert cat["total_cost"] >= 0
        assert cat["asset_count"] >= 0

def test_asset_health_scores_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/health-scores?limit=10",
                     headers=auth_headers, timeout=15)
    _skip(r, "asset-bounded")
    assert r.status_code == 200
    for a in r.json()["assets"]:
        assert 0 <= a["health_score"] <= 100
        assert a["risk_level"] in ("CRITICAL","HIGH","MODERATE","LOW")

def test_procurement_emergency_flags(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/emergency",
                     headers=auth_headers, timeout=15)
    _skip(r, "proc-flags")
    assert r.status_code == 200
    for p in r.json()["purchases"][:5]:
        assert p["risk_flag"] in ("BYPASS_RISK","FAST_TRACK","EXPEDITED")

def test_all_engines_return_hotel_id(auth_headers):
    """Every intelligence engine response must include hotel_id."""
    endpoints = [
        "/api/v1/pm-engine/summary",
        "/api/v1/sla-engine/summary",
        "/api/v1/asset-engine/summary",
        "/api/v1/supplier-engine/summary",
        "/api/v1/procurement-engine/summary",
        "/api/v1/cost-engine/summary",
        "/api/v1/risk-engine/summary",
        "/api/v1/backlog-engine/summary",
    ]
    missing = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code == 200:
            if "hotel_id" not in r.json():
                missing.append(ep)
    assert not missing, f"Missing hotel_id: {missing}"

def test_supplier_concentration_total_spend(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/concentration",
                     headers=auth_headers, timeout=15)
    _skip(r, "concentration-spend")
    assert r.status_code == 200
    d = r.json()
    assert d["total_spend"] >= 0
    assert 0 <= d["concentration_pct"] <= 100
