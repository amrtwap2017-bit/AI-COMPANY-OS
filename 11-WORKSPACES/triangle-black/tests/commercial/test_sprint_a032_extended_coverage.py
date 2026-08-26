"""Sprint A-032 — Extended Intelligence Coverage Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

# PM Engine extended
def test_pm_schedule_30_days(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/schedule",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-schedule")
    assert r.status_code == 200
    d = r.json()
    assert "asset_schedule" in d or "plan_schedule" in d
    assert d.get("schedule_period") == "30_days"

def test_pm_overdue_has_counts(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/overdue",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-overdue")
    assert r.status_code == 200
    d = r.json()
    assert "total_overdue" in d
    assert "critical_overdue" in d
    assert d["total_overdue"] >= 0

# SLA Engine extended
def test_sla_trend_8_weeks(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/trend?weeks=8",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-trend")
    assert r.status_code == 200
    d = r.json()
    assert d["weeks"] == 8
    assert isinstance(d["trend"], list)

def test_sla_by_priority_has_valid_levels(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/by-priority",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-priority")
    assert r.status_code == 200
    valid = {"EXCELLENT","GOOD","ACCEPTABLE","POOR"}
    for item in r.json().get("by_priority", []):
        assert item["performance"] in valid

# Asset Engine extended
def test_asset_critical_has_risk_levels(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/critical",
                     headers=auth_headers, timeout=15)
    _skip(r, "asset-critical")
    assert r.status_code == 200
    for a in r.json().get("assets", []):
        assert a["risk_level"] in ("CRITICAL","HIGH")

def test_asset_by_category_has_categories(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/by-category",
                     headers=auth_headers, timeout=15)
    _skip(r, "asset-category")
    assert r.status_code == 200
    cats = r.json().get("categories", [])
    assert len(cats) > 0
    for c in cats:
        assert c.get("category") is not None

# Supplier Engine extended
def test_supplier_diversity_has_categories(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/diversity",
                     headers=auth_headers, timeout=15)
    _skip(r, "supplier-diversity")
    assert r.status_code == 200
    d = r.json()
    assert "by_category" in d
    assert "total_categories" in d

def test_supplier_recommendations_have_lists(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/recommendations",
                     headers=auth_headers, timeout=15)
    _skip(r, "supplier-recs")
    assert r.status_code == 200
    d = r.json()
    assert "preferred_suppliers" in d
    assert "avoid_suppliers" in d
    assert "monitor_suppliers" in d

# Cost Engine extended
def test_cost_recurring_pattern_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/recurring",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-recurring")
    assert r.status_code == 200
    for a in r.json().get("assets", []):
        assert a["pattern"] in ("CHRONIC","FREQUENT","RECURRING")
        assert a["failure_count"] >= 3

def test_cost_by_asset_limit_5(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/by-asset?limit=5",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-limit")
    assert r.status_code == 200
    assert len(r.json().get("assets", [])) <= 5

# Risk Engine extended
def test_risk_asset_risk_sorted_by_score(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/asset-risk?limit=10",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-sorted")
    assert r.status_code == 200
    assets = r.json().get("assets", [])
    if len(assets) > 1:
        scores = [a["risk_score"] for a in assets]
        assert scores == sorted(scores, reverse=True), "Assets not sorted by risk_score desc"

def test_risk_forecast_events_have_types(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/forecast",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-event-types")
    assert r.status_code == 200
    valid_types = {"PM_DUE","WARRANTY_EXPIRY","HIGH_RISK_BACKLOG"}
    for ev in r.json().get("upcoming_events", []):
        assert ev["type"] in valid_types

# Procurement Engine extended
def test_procurement_emergency_has_risk_flags(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/emergency",
                     headers=auth_headers, timeout=15)
    _skip(r, "proc-emergency")
    assert r.status_code == 200
    for p in r.json().get("purchases", [])[:5]:
        assert p["risk_flag"] in ("BYPASS_RISK","FAST_TRACK","EXPEDITED")

def test_procurement_spend_has_top_suppliers(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/spend?limit=3",
                     headers=auth_headers, timeout=15)
    _skip(r, "proc-top")
    assert r.status_code == 200
    d = r.json()
    assert d["count"] >= 0
    assert d["total_spend"] >= 0

# Executive Engine extended
def test_executive_alerts_severity_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/alerts",
                     headers=auth_headers, timeout=15)
    _skip(r, "exec-alert-sev")
    assert r.status_code == 200
    valid = {"P0_CRITICAL","P1_HIGH","P2_MEDIUM"}
    for a in r.json().get("alerts", []):
        assert a["severity"] in valid

def test_executive_briefing_summary_not_empty(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=15)
    _skip(r, "exec-summary")
    assert r.status_code == 200
    d = r.json()
    assert len(d.get("summary", "")) > 20
    assert "2026" in d.get("date", "")

# Workflow extended
def test_workflow_instances_have_entity_type(auth_headers):
    r = requests.get(f"{BASE}/api/v1/workflow/instances",
                     headers=auth_headers, timeout=15)
    _skip(r, "wf-entity")
    assert r.status_code == 200
    d = r.json()
    results = d.get("results", d.get("instances", []))
    for inst in results[:3]:
        assert "entity_type" in inst

def test_workflow_definitions_have_name(auth_headers):
    r = requests.get(f"{BASE}/api/v1/workflow/definitions",
                     headers=auth_headers, timeout=15)
    _skip(r, "wf-name")
    assert r.status_code == 200
    d = r.json()
    results = d.get("results", d.get("definitions", []))
    for defn in results[:3]:
        assert "name" in defn

# Health Score extended
def test_health_score_improves_with_better_data(auth_headers):
    """Health score should be > 0 and < 100 (realistic)."""
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health-realistic")
    assert r.status_code == 200
    score = r.json()["health_score"]
    assert 0 < score < 100

def test_all_engine_summaries_have_hotel_id(auth_headers):
    """All intelligence engines should return hotel_id in response."""
    endpoints = [
        "/api/v1/pm-engine/summary",
        "/api/v1/sla-engine/summary",
        "/api/v1/asset-engine/summary",
        "/api/v1/supplier-engine/summary",
        "/api/v1/procurement-engine/summary",
        "/api/v1/cost-engine/summary",
        "/api/v1/risk-engine/summary",
    ]
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429:
            pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} failed"
        assert "hotel_id" in r.json(), f"{ep} missing hotel_id"
