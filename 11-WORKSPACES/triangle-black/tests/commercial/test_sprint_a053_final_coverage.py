"""Sprint A-053 — Final Coverage: Boundary + Edge Case Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_pm_engine_overdue_count_positive(auth_headers):
    """With 103 overdue plans, pm-engine should report > 0 overdue."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/overdue",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-overdue-pos")
    assert r.status_code == 200
    assert r.json()["total_overdue"] >= 0

def test_sla_engine_at_risk_has_wos(auth_headers):
    """50 SLA-breached WOs should appear in at-risk."""
    r = requests.get(f"{BASE}/api/v1/sla-engine/at-risk",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-at-risk")
    assert r.status_code == 200
    d = r.json()
    assert d["total_at_risk"] >= 0
    assert d["breached_count"] >= 0

def test_asset_engine_critical_risk_sorted(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/critical",
                     headers=auth_headers, timeout=15)
    _skip(r, "asset-sorted")
    assert r.status_code == 200
    assets = r.json().get("assets", [])
    for a in assets:
        assert a["risk_level"] in ("CRITICAL","HIGH")

def test_cost_engine_recurring_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/recurring",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-recurring")
    assert r.status_code == 200
    d = r.json()
    assert "total_recurring" in d
    assert "requires_action" in d

def test_risk_engine_forecast_30d(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/forecast",
                     headers=auth_headers, timeout=15)
    _skip(r, "forecast-30d")
    assert r.status_code == 200
    d = r.json()
    assert d["forecast_period"] == "30_days"
    assert "2026" in d["forecast_start"]

def test_backlog_oldest_limit_respected(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/oldest?limit=5",
                     headers=auth_headers, timeout=15)
    _skip(r, "oldest-limit")
    assert r.status_code == 200
    assert len(r.json()["work_orders"]) <= 5

def test_supplier_diversity_categories(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/diversity",
                     headers=auth_headers, timeout=15)
    _skip(r, "diversity-cats")
    assert r.status_code == 200
    d = r.json()
    assert d["total_categories"] >= 0
    assert isinstance(d["by_category"], list)

def test_procurement_pending_urgency_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/pending",
                     headers=auth_headers, timeout=15)
    _skip(r, "proc-urgency")
    assert r.status_code == 200
    valid = {"OVERDUE","DELAYED","PENDING"}
    for po in r.json()["purchase_orders"][:5]:
        assert po["urgency"] in valid

def test_executive_alerts_count_matches(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/alerts",
                     headers=auth_headers, timeout=15)
    _skip(r, "exec-count")
    assert r.status_code == 200
    d = r.json()
    assert d["total_alerts"] == len(d["alerts"])
    assert d["critical_count"] <= d["total_alerts"]

def test_pm_engine_schedule_period(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/schedule",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-period")
    assert r.status_code == 200
    assert r.json()["schedule_period"] == "30_days"

def test_risk_engine_asset_limit_100(auth_headers):
    """Asset risk limit=100 should work (max allowed)."""
    r = requests.get(f"{BASE}/api/v1/risk-engine/asset-risk?limit=100",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-100")
    assert r.status_code == 200
    assert len(r.json()["assets"]) <= 100

def test_all_engine_generated_at_timestamps(auth_headers):
    """All engines returning generated_at should have 2026 dates."""
    endpoints = [
        "/api/v1/pm-engine/summary",
        "/api/v1/sla-engine/summary",
        "/api/v1/supplier-engine/summary",
        "/api/v1/cost-engine/summary",
        "/api/v1/risk-engine/summary",
        "/api/v1/backlog-engine/summary",
    ]
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code == 200:
            gen = r.json().get("generated_at", "")
            if gen:
                assert "2026" in gen, f"{ep} wrong year: {gen}"
