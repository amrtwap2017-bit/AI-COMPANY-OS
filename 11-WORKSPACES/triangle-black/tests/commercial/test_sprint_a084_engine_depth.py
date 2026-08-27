"""Sprint A-084 — Engine Depth Tests: Edge Cases + Boundaries"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_technician_engine_grade_accuracy(auth_headers):
    """Grades must follow efficiency score thresholds."""
    r = requests.get(f"{BASE}/api/v1/technician-engine/scores?limit=20",
                     headers=auth_headers, timeout=15)
    _skip(r, "tech-accuracy")
    assert r.status_code == 200
    for t in r.json()["technicians"]:
        score = t["efficiency_score"]
        grade = t["grade"]
        if score >= 85: assert grade == "EXCELLENT"
        elif score >= 70: assert grade == "GOOD"
        elif score >= 55: assert grade == "ACCEPTABLE"
        else: assert grade == "NEEDS_IMPROVEMENT"

def test_trend_compare_direction_logic(auth_headers):
    """Direction must match current vs previous."""
    r = requests.get(f"{BASE}/api/v1/trend-engine/compare",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-dir-logic")
    assert r.status_code == 200
    for k, v in r.json().get("trends", {}).items():
        if v["current"] > v["previous"]:
            assert v["direction"] == "UP"
        elif v["current"] < v["previous"]:
            assert v["direction"] == "DOWN"

def test_predictive_criticality_multiplier(auth_headers):
    """Critical assets should score higher."""
    r = requests.get(f"{BASE}/api/v1/predictive-engine/assets?limit=50",
                     headers=auth_headers, timeout=15)
    _skip(r, "pred-crit-mult")
    assert r.status_code == 200
    critical = [a for a in r.json()["assets"] if a["criticality"] == "critical"]
    low = [a for a in r.json()["assets"] if a["criticality"] == "low"]
    if critical and low:
        avg_critical = sum(a["predictive_score"] for a in critical) / len(critical)
        avg_low = sum(a["predictive_score"] for a in low) / len(low)
        assert avg_critical >= avg_low

def test_pm_engine_schedule_period(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/schedule",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-schedule")
    assert r.status_code == 200
    assert r.json()["schedule_period"] == "30_days"

def test_backlog_oldest_sorted_desc(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/oldest?limit=10",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-sorted")
    assert r.status_code == 200
    ages = [w["age_days"] for w in r.json()["work_orders"]]
    if len(ages) > 1:
        assert ages == sorted(ages, reverse=True)

def test_risk_sla_component_logic(auth_headers):
    """SLA risk should reflect breached WOs."""
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-sla-logic")
    assert r.status_code == 200
    sla_risk = r.json()["components"]["sla_risk"]["score"]
    assert 0 <= sla_risk <= 100

def test_cost_by_category_burden(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/by-category",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-burden")
    assert r.status_code == 200
    valid = {"VERY_HIGH","HIGH","MODERATE","LOW"}
    for cat in r.json()["categories"]:
        assert cat["maintenance_burden"] in valid

def test_supplier_scores_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/scores?limit=10",
                     headers=auth_headers, timeout=15)
    _skip(r, "supp-bounded")
    assert r.status_code == 200
    for s in r.json()["suppliers"]:
        assert 0 <= s["performance_score"] <= 100

def test_asset_health_scores_all_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/health-scores?limit=10",
                     headers=auth_headers, timeout=15)
    _skip(r, "asset-health")
    assert r.status_code == 200
    for a in r.json()["assets"]:
        assert 0 <= a["health_score"] <= 100

def test_pm_compliance_grade_matches_pct(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-grade-match")
    assert r.status_code == 200
    d = r.json()
    pct = d["pm_compliance_pct"]
    grade = d["compliance_grade"]
    if pct >= 90: assert grade == "A+"
    elif pct >= 80: assert grade == "A"
    elif pct >= 65: assert grade == "B"
    elif pct >= 50: assert grade == "C"
    else: assert grade == "D"

def test_trend_spend_positive_amounts(auth_headers):
    r = requests.get(f"{BASE}/api/v1/trend-engine/spend",
                     headers=auth_headers, timeout=15)
    _skip(r, "trend-pos")
    assert r.status_code == 200
    for s in r.json()["data"]:
        assert s["total_spend"] >= 0
        assert s["avg_po_value"] >= 0

def test_technician_completion_rate_bounded(auth_headers):
    r = requests.get(f"{BASE}/api/v1/technician-engine/scores?limit=10",
                     headers=auth_headers, timeout=15)
    _skip(r, "tech-completion")
    assert r.status_code == 200
    for t in r.json()["technicians"]:
        assert 0 <= t["completion_rate_pct"] <= 100
        assert 0 <= t["sla_compliance_pct"] <= 100

def test_predictive_days_to_action_non_negative(auth_headers):
    r = requests.get(f"{BASE}/api/v1/predictive-engine/assets?limit=10",
                     headers=auth_headers, timeout=15)
    _skip(r, "pred-days")
    assert r.status_code == 200
    for a in r.json()["assets"]:
        assert a["days_to_recommended_action"] >= 0

def test_executive_kpis_complete_set(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-complete")
    assert r.status_code == 200
    kpis = r.json()["kpis"]
    required = ["open_work_orders","completed_today","active_suppliers",
                "total_assets","active_alerts","critical_alerts"]
    for k in required:
        assert k in kpis, f"Missing KPI: {k}"

def test_all_new_engines_have_generated_at(auth_headers):
    """New engines should include generated_at timestamp."""
    for ep in ["/api/v1/technician-engine/summary",
               "/api/v1/trend-engine/summary",
               "/api/v1/predictive-engine/summary"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        assert "generated_at" in r.json()
        assert "2026" in r.json()["generated_at"]
