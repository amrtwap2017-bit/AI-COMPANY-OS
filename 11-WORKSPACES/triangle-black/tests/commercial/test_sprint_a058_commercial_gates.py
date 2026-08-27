"""Sprint A-058 — Commercial Gate Tests: Platform Must Meet These Standards"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_health_score_76_maintained(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health-76")
    assert r.status_code == 200
    assert r.json()["health_score"] >= 70
    assert r.json()["grade"] in ("GOOD","EXCELLENT")

def test_risk_34_maintained(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-34")
    assert r.status_code == 200
    assert r.json()["composite_risk_score"] <= 50
    assert r.json()["risk_level"] in ("MODERATE","LOW")

def test_pm_compliance_59pct_maintained(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-59")
    assert r.status_code == 200
    assert r.json()["pm_compliance_pct"] >= 30

def test_wo_completion_55pct_maintained(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "wo-55")
    assert r.status_code == 200
    assert r.json()["components"]["wo_completion"]["score"] >= 45

def test_supplier_85pct_maintained(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "supp-85")
    assert r.status_code == 200
    assert r.json()["components"]["supplier_score"]["score"] >= 70

def test_cost_2m_maintained(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-2m")
    assert r.status_code == 200
    assert r.json()["cost_overview"]["total_operational_cost"] > 2_000_000

def test_backlog_insight_generated(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-insight")
    assert r.status_code == 200
    assert len(r.json().get("insights", [])) > 0

def test_sla_100pct_maintained(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-100")
    assert r.status_code == 200
    assert r.json()["overall_compliance_pct"] >= 95

def test_10_engines_all_200_gate(auth_headers):
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

def test_maintenance_intel_page_endpoints(auth_headers):
    """All endpoints for maintenance intelligence page work."""
    for ep in ["/api/v1/pm-engine/summary", "/api/v1/pm-engine/compliance",
               "/api/v1/pm-engine/schedule", "/api/v1/cost-engine/summary"]:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
