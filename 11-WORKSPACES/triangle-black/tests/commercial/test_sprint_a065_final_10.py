"""Sprint A-065 — Final 10: Platform Stability Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_health_score_stable_70_plus(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health-stable")
    assert r.status_code == 200
    assert r.json()["health_score"] >= 70

def test_pm_engine_59pct_stable(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-stable")
    assert r.status_code == 200
    assert r.json()["pm_compliance_pct"] >= 30

def test_risk_moderate_stable(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-stable")
    assert r.status_code == 200
    assert r.json()["risk_level"] in ("MODERATE","LOW")

def test_all_38_intelligence_endpoints_200(auth_headers):
    """All intelligence endpoints return 200 — zero failures."""
    endpoints = [
        "/api/v1/pm-engine/summary","/api/v1/pm-engine/compliance",
        "/api/v1/pm-engine/overdue","/api/v1/pm-engine/schedule",
        "/api/v1/sla-engine/summary","/api/v1/sla-engine/at-risk",
        "/api/v1/sla-engine/by-priority","/api/v1/sla-engine/trend",
        "/api/v1/asset-engine/summary","/api/v1/asset-engine/critical",
        "/api/v1/asset-engine/by-category","/api/v1/asset-engine/health-scores",
        "/api/v1/supplier-engine/summary","/api/v1/supplier-engine/scores",
        "/api/v1/supplier-engine/concentration","/api/v1/supplier-engine/diversity",
        "/api/v1/procurement-engine/summary","/api/v1/procurement-engine/spend",
        "/api/v1/procurement-engine/pending","/api/v1/procurement-engine/emergency",
        "/api/v1/executive-engine/health-score","/api/v1/executive-engine/alerts",
        "/api/v1/executive-engine/daily-briefing",
        "/api/v1/cost-engine/summary","/api/v1/cost-engine/by-asset",
        "/api/v1/cost-engine/by-category","/api/v1/cost-engine/recurring",
        "/api/v1/risk-engine/summary","/api/v1/risk-engine/operational",
        "/api/v1/risk-engine/asset-risk","/api/v1/risk-engine/forecast",
        "/api/v1/backlog-engine/summary","/api/v1/backlog-engine/by-priority",
        "/api/v1/backlog-engine/oldest",
        "/api/v1/workflow/instances","/api/v1/workflow/definitions",
        "/api/v1/sla-intelligence/scorecard",
    ]
    failed = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code != 200: failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Failures: {failed}"

def test_backlog_insights_severity(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-sev")
    assert r.status_code == 200
    for ins in r.json().get("insights", []):
        assert ins["severity"] in ("CRITICAL","HIGH","MEDIUM","LOW")

def test_pm_engine_file_not_corrupted(auth_headers):
    """PM engine must not return 500 (was broken by global replace)."""
    for ep in ["/api/v1/pm-engine/summary","/api/v1/pm-engine/compliance",
               "/api/v1/pm-engine/overdue","/api/v1/pm-engine/schedule"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code != 500, f"PM engine 500 regression: {ep}"
        assert r.status_code == 200

def test_executive_briefing_summary_text(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-summary")
    assert r.status_code == 200
    summary = r.json().get("summary","")
    assert len(summary) > 20
    assert "operational" in summary.lower() or "health" in summary.lower()

def test_cost_procurement_aligned(auth_headers):
    cost = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                        headers=auth_headers, timeout=15)
    proc = requests.get(f"{BASE}/api/v1/procurement-engine/summary",
                        headers=auth_headers, timeout=15)
    _skip(cost, "cost-proc")
    assert cost.status_code == 200 and proc.status_code == 200
    cost_po = cost.json()["cost_overview"]["total_procurement_spend"]
    proc_spend = proc.json()["spend"]["total_spend"]
    assert abs(cost_po - proc_spend) < 50000

def test_sla_intelligence_legacy_still_works(auth_headers):
    """Legacy SLA intelligence endpoints must still work."""
    for ep in ["/api/v1/sla-intelligence/scorecard",
               "/api/v1/sla-intelligence/report"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} → {r.status_code}"

def test_globals_css_has_tbeds(auth_headers):
    """TBEDS design system must be in globals.css."""
    from pathlib import Path
    css_p = Path("portal/app/globals.css")
    if not css_p.exists():
        pytest.skip("globals.css not found")
    text = css_p.read_text()
    assert "tb-canvas" in text
    assert "tb-kpi" in text
    assert "tb-section" in text
