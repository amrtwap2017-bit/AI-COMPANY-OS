"""Sprint A-017 — Unified Intelligence Dashboard API surface test"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_all_intelligence_engines_200(auth_headers):
    """Verify all 6 intelligence engine endpoints return 200."""
    endpoints = [
        "/api/v1/executive-engine/health-score",
        "/api/v1/executive-engine/daily-briefing",
        "/api/v1/executive-engine/alerts",
        "/api/v1/sla-engine/summary",
        "/api/v1/sla-engine/by-priority",
        "/api/v1/sla-engine/at-risk",
        "/api/v1/asset-engine/summary",
        "/api/v1/asset-engine/health-scores",
        "/api/v1/asset-engine/by-category",
        "/api/v1/procurement-engine/summary",
        "/api/v1/procurement-engine/spend",
        "/api/v1/procurement-engine/pending",
        "/api/v1/pm-engine/summary",
        "/api/v1/pm-engine/compliance",
        "/api/v1/supplier-engine/summary",
        "/api/v1/supplier-engine/concentration",
    ]
    failed = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429:
            pytest.skip("Rate limited")
        if r.status_code != 200:
            failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Failed: {failed}"

def test_health_score_weighted_correctly(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health-score")
    assert r.status_code == 200
    d = r.json()
    comps = d.get("components", {})
    weights = [v["weight"] for v in comps.values()]
    assert abs(sum(weights) - 1.0) < 0.01, f"Weights don't sum to 1.0: {sum(weights)}"

def test_sla_engine_targets_hierarchy(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-targets")
    assert r.status_code == 200
    targets = r.json().get("sla_targets", {})
    assert targets.get("emergency", 99) < targets.get("critical", 0)
    assert targets.get("critical", 99) < targets.get("high", 0)
    assert targets.get("high", 99) < targets.get("medium", 0)

def test_procurement_spend_positive(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "proc-spend-pos")
    assert r.status_code == 200
    s = r.json().get("spend", {})
    assert s.get("total_spend", 0) >= 0
    assert s.get("total_orders", 0) >= 0

def test_asset_portfolio_integrity(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "asset-integrity")
    assert r.status_code == 200
    p = r.json().get("portfolio", {})
    assert p.get("total_assets", 0) >= p.get("with_pm_coverage", 0)
    assert 0 <= p.get("pm_coverage_pct", 0) <= 100

def test_pm_compliance_bounds(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/compliance",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-bounds")
    assert r.status_code == 200
    d = r.json()
    pct = d.get("overall_compliance_pct", 0)
    assert 0 <= pct <= 100

def test_supplier_engine_scores_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/scores?limit=10",
                     headers=auth_headers, timeout=15)
    _skip(r, "supplier-bounded")
    assert r.status_code == 200
    for s in r.json().get("suppliers", []):
        assert 0 <= s["performance_score"] <= 100

def test_intelligence_hub_no_500s(auth_headers):
    """Regression: ensure no intelligence endpoint returns 500."""
    core_endpoints = [
        "/api/v1/executive-engine/daily-briefing",
        "/api/v1/sla-engine/trend",
        "/api/v1/asset-engine/critical",
        "/api/v1/procurement-engine/emergency",
        "/api/v1/pm-engine/overdue",
        "/api/v1/supplier-engine/recommendations",
    ]
    for ep in core_endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429:
            pytest.skip("Rate limited")
        assert r.status_code != 500, f"{ep} returned 500: {r.text[:100]}"
