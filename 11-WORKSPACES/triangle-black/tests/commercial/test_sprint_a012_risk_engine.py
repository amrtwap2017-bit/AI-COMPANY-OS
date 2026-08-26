"""Sprint A-012 — Operational Risk Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_risk_engine_requires_auth():
    r = requests.get(f"{BASE}/api/v1/risk-engine/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_risk_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-summary")
    assert r.status_code == 200
    d = r.json()
    assert "overall_risk_score" in d
    assert "risk_grade" in d
    assert "domain_scores" in d
    assert "top_risk_factors" in d
    assert "executive_summary" in d
    assert d["risk_grade"] in ("LOW","MODERATE","HIGH","CRITICAL")

def test_risk_summary_score_range(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-range")
    assert r.status_code == 200
    assert 0 <= r.json()["overall_risk_score"] <= 100

def test_risk_assets_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/assets",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-assets")
    assert r.status_code == 200
    d = r.json()
    assert d["domain"] == "ASSETS"
    assert 0 <= d["score"] <= 100

def test_risk_operations_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/operations",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-ops")
    assert r.status_code == 200
    d = r.json()
    assert d["domain"] == "OPERATIONS"
    assert "sla_breach_rate_pct" in d

def test_risk_maintenance_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/maintenance",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-maint")
    assert r.status_code == 200
    d = r.json()
    assert d["domain"] == "MAINTENANCE"
    assert "pm_completion_pct" in d

def test_risk_finance_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/finance",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-fin")
    assert r.status_code == 200
    d = r.json()
    assert d["domain"] == "FINANCE"
    assert "overdue_rate_pct" in d

def test_risk_procurement_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/procurement",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-proc")
    assert r.status_code == 200
    d = r.json()
    assert d["domain"] == "PROCUREMENT"
    assert "blacklisted_suppliers" in d

def test_risk_summary_has_all_5_domains(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-domains")
    assert r.status_code == 200
    d = r.json()
    domains = set(d.get("domain_scores", {}).keys())
    required = {"ASSETS", "OPERATIONS", "MAINTENANCE", "FINANCE", "PROCUREMENT"}
    assert required == domains
