"""Sprint A-062 — Platform Completeness Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_platform_overall_health_stable(auth_headers):
    """Platform health must be >= 70 (GOOD) — stable over sessions."""
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health-stable")
    assert r.status_code == 200
    d = r.json()
    assert d["health_score"] >= 70
    assert d["grade"] in ("GOOD","EXCELLENT")
    for comp in d["components"].values():
        assert 0 <= comp["score"] <= 100

def test_all_sla_targets_ordered(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-ordered")
    assert r.status_code == 200
    t = r.json().get("sla_targets", {})
    assert t.get("emergency", 99) < t.get("critical", 0)
    assert t.get("critical", 99) < t.get("high", 0)
    assert t.get("high", 99) < t.get("medium", 0)

def test_backlog_engine_hotel_id_scoped(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-scope")
    assert r.status_code == 200
    assert r.json()["hotel_id"] == "tb-default-hotel-000000000001"

def test_maintenance_intelligence_page_ready(auth_headers):
    """Maintenance intelligence page endpoints all return 200."""
    for ep in ["/api/v1/pm-engine/summary","/api/v1/pm-engine/compliance",
               "/api/v1/pm-engine/schedule","/api/v1/cost-engine/summary"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} → {r.status_code}"

def test_demo_presentation_page_ready(auth_headers):
    """Demo presentation page endpoints all return 200."""
    for ep in ["/api/v1/executive-engine/health-score",
               "/api/v1/risk-engine/operational",
               "/api/v1/asset-engine/summary",
               "/api/v1/cost-engine/summary",
               "/api/v1/backlog-engine/summary"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} → {r.status_code}"

def test_intelligence_hub_page_ready(auth_headers):
    """Intelligence hub page endpoints all return 200."""
    for ep in ["/api/v1/executive-engine/health-score",
               "/api/v1/sla-engine/summary",
               "/api/v1/asset-engine/summary",
               "/api/v1/procurement-engine/summary",
               "/api/v1/pm-engine/summary"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} → {r.status_code}"

def test_pilot_dashboard_page_ready(auth_headers):
    """Pilot dashboard page endpoints return 200."""
    for ep in ["/api/v1/executive-engine/daily-briefing",
               "/api/v1/cost-engine/summary",
               "/api/v1/pm-engine/summary",
               "/api/v1/sla-engine/summary"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200

def test_command_center_page_ready(auth_headers):
    """Command center page endpoints return 200."""
    for ep in ["/api/v1/pm-engine/summary",
               "/api/v1/supplier-engine/summary",
               "/api/v1/workflow/instances"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200

def test_intelligence_loop_page_ready(auth_headers):
    """Intelligence loop page endpoints return 200."""
    for ep in ["/api/v1/backlog-engine/summary",
               "/api/v1/sla-engine/summary",
               "/api/v1/pm-engine/summary"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200

def test_complete_platform_session_summary(auth_headers):
    """Final validation: all key metrics in acceptable range."""
    health = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                          headers=auth_headers, timeout=15)
    risk = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                        headers=auth_headers, timeout=15)
    pm = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                      headers=auth_headers, timeout=15)
    _skip(health, "summary")
    assert health.status_code == 200 and risk.status_code == 200 and pm.status_code == 200
    h = health.json()["health_score"]
    r = risk.json()["composite_risk_score"]
    p = pm.json()["pm_compliance_pct"]
    assert h >= 70, f"Health too low: {h}"
    assert r <= 50, f"Risk too high: {r}"
    assert p >= 30, f"PM compliance too low: {p}"
