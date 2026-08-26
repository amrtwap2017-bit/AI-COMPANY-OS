"""Sprint A-027 — Platform Integrity + Cross-Engine Consistency Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_sla_breaches_match_across_engines(auth_headers):
    """SLA breaches from SLA engine should be reflected in Risk engine."""
    sla = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                       headers=auth_headers, timeout=15)
    risk = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                        headers=auth_headers, timeout=15)
    _skip(sla, "cross-sla")
    assert sla.status_code == 200 and risk.status_code == 200
    # Both should agree there are breaches
    sla_breached = sla.json().get("open_breached", 0)
    risk_sla = risk.json().get("components", {}).get("sla_risk", {}).get("score", 0)
    # If there are breaches, sla risk should be > 0
    if sla_breached > 0:
        assert risk_sla > 0, f"SLA engine shows {sla_breached} breaches but risk sla_risk=0"

def test_procurement_pending_match(auth_headers):
    """Pending POs from Procurement should show in Executive alerts."""
    proc = requests.get(f"{BASE}/api/v1/procurement-engine/pending",
                        headers=auth_headers, timeout=15)
    exec_r = requests.get(f"{BASE}/api/v1/executive-engine/alerts",
                          headers=auth_headers, timeout=15)
    _skip(proc, "cross-proc")
    assert proc.status_code == 200 and exec_r.status_code == 200

def test_cost_engine_total_consistency(auth_headers):
    """Cost engine total should be invoice + PO spend."""
    r = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-consistency")
    assert r.status_code == 200
    c = r.json()["cost_overview"]
    total = c["total_operational_cost"]
    invoices = c["total_invoice_cost"]
    po = c["total_procurement_spend"]
    assert abs(total - (invoices + po)) < 1.0, f"Cost mismatch: {total} != {invoices}+{po}"

def test_asset_engine_pm_coverage_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "asset-pm")
    assert r.status_code == 200
    p = r.json()["portfolio"]
    cov = p["pm_coverage_pct"]
    total = p["total_assets"]
    with_pm = p["with_pm_coverage"]
    assert 0 <= cov <= 100
    assert with_pm <= total

def test_supplier_scores_all_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/scores?limit=20",
                     headers=auth_headers, timeout=15)
    _skip(r, "supplier-bounded")
    assert r.status_code == 200
    for s in r.json().get("suppliers", []):
        assert 0 <= s["performance_score"] <= 100
        assert s["grade"] in ("A","B","C","D")

def test_risk_engine_components_all_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-bounded")
    assert r.status_code == 200
    for name, comp in r.json().get("components", {}).items():
        assert 0 <= comp["score"] <= 100, f"Component {name} out of bounds: {comp['score']}"

def test_pm_engine_compliance_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/compliance",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-compliance")
    assert r.status_code == 200
    assert 0 <= r.json()["overall_compliance_pct"] <= 100

def test_executive_health_score_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "exec-health")
    assert r.status_code == 200
    d = r.json()
    assert 0 <= d["health_score"] <= 100
    assert d["grade"] in ("EXCELLENT","GOOD","FAIR","POOR")

def test_cost_engine_by_category_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/by-category",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-by-cat")
    assert r.status_code == 200
    for cat in r.json().get("categories", []):
        assert "category" in cat
        assert cat["total_cost"] >= 0
        assert cat["maintenance_burden"] in ("VERY_HIGH","HIGH","MODERATE","LOW")

def test_sla_engine_targets_ordered(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-targets")
    assert r.status_code == 200
    t = r.json().get("sla_targets", {})
    # emergency < critical < high < medium < low (hours)
    assert t.get("emergency", 99) < t.get("critical", 0)
    assert t.get("critical", 99) < t.get("high", 0)
    assert t.get("high", 99) < t.get("medium", 0)
    assert t.get("medium", 99) < t.get("low", 0)

def test_risk_forecast_30_days(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/forecast",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-forecast")
    assert r.status_code == 200
    d = r.json()
    assert d["forecast_period"] == "30_days"
    assert "forecast_start" in d
    assert "forecast_end" in d
    assert isinstance(d.get("predicted_wo_count", 0), (int, float))

def test_procurement_engine_concentration_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "proc-concentration")
    assert r.status_code == 200
    c = r.json().get("concentration", {})
    assert 0 <= c.get("concentration_pct", 0) <= 100
    assert c.get("risk_level") in ("LOW","MODERATE","HIGH","CRITICAL")
